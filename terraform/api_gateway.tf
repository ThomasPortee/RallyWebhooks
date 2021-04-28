resource "aws_api_gateway_rest_api" "cox-webhook-api"{
    name = "dev-cox-webhook-messenger-1-1-4"
    description = "Cox Webhook Reflector Lambda Development"
}

output "base_url" {
  value = aws_api_gateway_deployment.example.invoke_url
}
