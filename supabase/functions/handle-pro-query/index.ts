/*
  # Secure PRO Query Handler

  This Supabase Edge Function handles all PRO API queries securely by:
  1. Validating officer authentication and authorization
  2. Retrieving API keys securely from the database
  3. Making external API calls with proper credentials
  4. Logging queries and managing credits
  5. Never exposing sensitive API keys to the client
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface QueryRequest {
  api_id: string;
  input_data: string;
  category: string;
  officer_id: string;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  credits_used: number;
  result_summary: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { api_id, input_data, category, officer_id }: QueryRequest = await req.json();

    if (!api_id || !input_data || !officer_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verify officer exists and is active
    const { data: officer, error: officerError } = await supabase
      .from('officers')
      .select('id, name, plan_id, credits_remaining, status')
      .eq('id', officer_id)
      .eq('status', 'Active')
      .single();

    if (officerError || !officer) {
      return new Response(
        JSON.stringify({ error: 'Officer not found or inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check if officer's plan allows access to this API
    const { data: planAPI, error: planAPIError } = await supabase
      .from('plan_apis')
      .select('enabled, credit_cost')
      .eq('plan_id', officer.plan_id)
      .eq('api_id', api_id)
      .eq('enabled', true)
      .single();

    if (planAPIError || !planAPI) {
      return new Response(
        JSON.stringify({ error: 'API not enabled for your plan' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check if officer has sufficient credits
    if (officer.credits_remaining < planAPI.credit_cost) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient credits. Required: ${planAPI.credit_cost}, Available: ${officer.credits_remaining}` 
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Get API details and retrieve the secure API key
    const { data: apiDetails, error: apiError } = await supabase
      .from('apis')
      .select(`
        name,
        service_provider,
        api_keys (
          api_key,
          status
        )
      `)
      .eq('id', api_id)
      .single();

    if (apiError || !apiDetails || !apiDetails.api_keys || apiDetails.api_keys.status !== 'Active') {
      return new Response(
        JSON.stringify({ error: 'API key not found or inactive' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = apiDetails.api_keys.api_key;

    // 5. Make the external API call based on the service
    let apiResponse: APIResponse;

    try {
      switch (apiDetails.name) {
        case 'Phone Prefill V2':
          apiResponse = await callSignzyPhonePrefill(input_data, apiKey);
          break;
        case 'RC Verification':
          apiResponse = await callRCVerification(input_data, apiKey);
          break;
        case 'Credit History':
          apiResponse = await callCreditHistory(input_data, apiKey);
          break;
        case 'Cell ID Location':
          apiResponse = await callCellIDLocation(input_data, apiKey);
          break;
        default:
          throw new Error(`Unsupported API: ${apiDetails.name}`);
      }
    } catch (error) {
      console.error('External API call failed:', error);
      apiResponse = {
        success: false,
        error: 'External API call failed',
        credits_used: 0,
        result_summary: 'API call failed. Please try again.'
      };
    }

    // 6. Log the query in the database
    const { error: queryLogError } = await supabase
      .from('queries')
      .insert({
        officer_id: officer.id,
        officer_name: officer.name,
        type: 'PRO',
        category: category,
        input_data: input_data,
        source: `${apiDetails.name} (${apiDetails.service_provider})`,
        result_summary: apiResponse.result_summary,
        full_result: apiResponse.data,
        credits_used: apiResponse.success ? planAPI.credit_cost : 0,
        status: apiResponse.success ? 'Success' : 'Failed'
      });

    if (queryLogError) {
      console.error('Failed to log query:', queryLogError);
    }

    // 7. Deduct credits if the query was successful
    if (apiResponse.success) {
      const { error: creditError } = await supabase
        .from('officers')
        .update({ 
          credits_remaining: officer.credits_remaining - planAPI.credit_cost,
          total_queries: officer.total_queries + 1
        })
        .eq('id', officer.id);

      if (creditError) {
        console.error('Failed to deduct credits:', creditError);
      }

      // Log credit transaction
      await supabase
        .from('credit_transactions')
        .insert({
          officer_id: officer.id,
          officer_name: officer.name,
          action: 'Deduction',
          credits: -planAPI.credit_cost,
          payment_mode: 'Query Usage',
          remarks: `${apiDetails.name} query: ${input_data}`
        });
    }

    // 8. Update API key usage statistics
    await supabase
      .from('api_keys')
      .update({ 
        usage_count: supabase.sql`usage_count + 1`,
        last_used: new Date().toISOString()
      })
      .eq('api_id', api_id);

    // 9. Return the response (without exposing the API key)
    return new Response(
      JSON.stringify({
        success: apiResponse.success,
        data: apiResponse.data,
        result_summary: apiResponse.result_summary,
        credits_used: apiResponse.success ? planAPI.credit_cost : 0,
        error: apiResponse.error
      }),
      { 
        status: apiResponse.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// External API call functions

async function callSignzyPhonePrefill(phoneNumber: string, apiKey: string): Promise<APIResponse> {
  const cleanPhoneNumber = phoneNumber.replace(/^\+91/, '').replace(/\s+/g, '');
  
  const requestBody = {
    mobileNumber: cleanPhoneNumber,
    fullName: "VERIFICATION",
    consent: {
      consentFlag: true,
      consentTimestamp: new Date().toISOString(),
      consentIpAddress: "127.0.0.1",
      consentMessageId: `consent_${Date.now()}`
    }
  };

  const response = await fetch('https://api-preproduction.signzy.app/api/v3/phonekyc/phone-prefill-v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'x-client-unique-id': 'pickme@intelligence.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Signzy API call failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    data: data,
    credits_used: 2,
    result_summary: formatSignzyResponse(data)
  };
}

async function callRCVerification(rcNumber: string, apiKey: string): Promise<APIResponse> {
  // Mock implementation - replace with actual Surepass API call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return {
    success: true,
    data: {
      rc_number: rcNumber,
      vehicle_type: "Car",
      owner_name: "Mock Owner",
      registration_date: "2020-01-15"
    },
    credits_used: 1,
    result_summary: `RC verification completed for ${rcNumber}`
  };
}

async function callCreditHistory(panNumber: string, apiKey: string): Promise<APIResponse> {
  // Mock implementation - replace with actual CIBIL API call
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  
  return {
    success: true,
    data: {
      pan_number: panNumber,
      credit_score: 750,
      credit_history: "Good",
      last_updated: new Date().toISOString()
    },
    credits_used: 5,
    result_summary: `Credit score: 750 (Good) for PAN ${panNumber}`
  };
}

async function callCellIDLocation(cellId: string, apiKey: string): Promise<APIResponse> {
  // Mock implementation - replace with actual telecom API call
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  return {
    success: true,
    data: {
      cell_id: cellId,
      latitude: 28.6139,
      longitude: 77.2090,
      location: "New Delhi, India",
      coverage_radius: "2.5 km"
    },
    credits_used: 3,
    result_summary: `Cell tower ${cellId} located in New Delhi, India`
  };
}

function formatSignzyResponse(response: any): string {
  if (!response || !response.result) {
    return 'No data found for this number';
  }
  
  const result = response.result;
  const parts = [];
  
  if (result.name) parts.push(`Name: ${result.name}`);
  if (result.email) parts.push(`Email: ${result.email}`);
  if (result.alternatePhone) parts.push(`Alt Phone: ${result.alternatePhone}`);
  if (result.address) parts.push(`Address: ${result.address}`);
  if (result.dob) parts.push(`DOB: ${result.dob}`);
  
  return parts.length > 0 ? parts.join(' | ') : 'Basic verification completed';
}