resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/weather-backend"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/weather-frontend"
  retention_in_days = var.log_retention_days
}
