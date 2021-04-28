terraform {
  required_providers {
      aws = {
          source = "hashicorp/aws"
      }
  }
}

provider "aws"{
    region  = "us-east-1"
}

resource "aws_lambda_function" "cox-webhook-reflector-114"{
    function_name = "cox-webhook-reflector-114"

    # The bucket created earlier
    s3_bucket = "cox-terraform-test"
    s3_key = "v.1.1.4/cox-webhook-reflector-114.zip"

    # main is the filename within the zipfile main.js
    # and "handler" is the name of the property under the handler function was
    # exported in that file
    handler = "app/index.handler"
    runtime = "nodejs12.x"

    role = "arn:aws:iam::047632847397:role/acct-managed/lambdarole"
}

resource "aws_api_gateway_resource" "proxy" {
   rest_api_id = aws_api_gateway_rest_api.cox-webhook-api.id
   parent_id   = aws_api_gateway_rest_api.cox-webhook-api.root_resource_id
   path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
   rest_api_id   = aws_api_gateway_rest_api.cox-webhook-api.id
   resource_id   = aws_api_gateway_resource.proxy.id
   http_method   = "ANY"
   authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
   rest_api_id = aws_api_gateway_rest_api.cox-webhook-api.id
   resource_id = aws_api_gateway_method.proxy.resource_id
   http_method = aws_api_gateway_method.proxy.http_method

   integration_http_method = "POST"
   type                    = "AWS_PROXY"
   uri                     = aws_lambda_function.cox-webhook-reflector-114.invoke_arn
}

resource "aws_api_gateway_method" "proxy_root" {
   rest_api_id   = aws_api_gateway_rest_api.dev-cox-webhook-api.id
   resource_id   = aws_api_gateway_rest_api.dev-cox-webhook-api.root_resource_id
   http_method   = "ANY"
   authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_root" {
   rest_api_id = aws_api_gateway_rest_api.dev-cox-webhook-api.id
   resource_id = aws_api_gateway_method.proxy_root.resource_id
   http_method = aws_api_gateway_method.proxy_root.http_method

   integration_http_method = "POST"
   type                    = "AWS_PROXY"
   uri                     = aws_lambda_function.cox-webhook-reflector-114.invoke_arn
}



resource "aws_api_gateway_deployment" "dev-cox-webhook-api-gateway" {
    depends_on = [
      aws_api_gateway_integration.lambda,
      aws_api_gateway_integration.lambda_root,
    ]

    rest_api_id = aws_api_gateway_rest_api.cox-webhook-api.id
    stage_name = "dev"
  
}

resource "aws_lambda_permission" "apigw" {
   statement_id  = "AllowAPIGatewayInvoke"
   action        = "lambda:InvokeFunction"
   function_name = aws_lambda_function.cox-webhook-reflector-114.function_name
   principal     = "apigateway.amazonaws.com"

   # The "/*/*" portion grants access from any method on any resource
   # within the API Gateway REST API.
   source_arn = "${aws_api_gateway_rest_api.cox-webhook-api.execution_arn}/*/*"
}


