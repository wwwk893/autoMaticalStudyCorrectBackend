# Grafana Provisioning Assets

Bundles prebuilt dashboards and datasource definitions for automated Grafana setup.

## Structure
- **`provisioning/datasources/datasource.yml`**
  - Registers Prometheus and Tempo data sources on startup.
- **`provisioning/dashboards/`**
  - Auto-loads the `automark.json` dashboard highlighting pipeline stage latency, failure rates, and image size distribution.

## Usage
- Mount this directory into `/etc/grafana/provisioning` when launching Grafana via docker-compose to auto-provision dashboards.
