# Observability Stack Scripts

Configuration assets for Grafana, Prometheus, and OpenTelemetry Collector deployments.

## Files
- **`prometheus.yml`**
  - Defines scrape jobs for API, worker, and exporter targets with relabeling suitable for docker-compose setups.
- **`otel-collector-config.yaml`**
  - Configures OTLP receivers and exporters, shipping traces to Grafana Tempo or other backends.
- **`grafana/`**
  - Provisioning manifests and JSON dashboards that visualise pipeline stage latency (P50/P95) and failure rates.

## Deployment
- Mount these files into the docker-compose stack to spin up a full observability environment with `make up`.
- Customize datasource endpoints inside `grafana/provisioning/datasources` to match your infrastructure.
