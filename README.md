<img align="right" width="100" height="74" src="https://user-images.githubusercontent.com/8277210/183290025-d7b24277-dfb4-4ce1-bece-7fe0ecd5efd4.svg" />

# Port Github Action

[![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)](https://join.slack.com/t/devex-community/shared_invite/zt-1bmf5621e-GGfuJdMPK2D8UN58qL4E_g)

Port is the Developer Platform meant to supercharge your DevOps and Developers, and allow you to regain control of your environment.

### Docs

- [Port Docs](https://docs.getport.io/integrations/github/github-action)

## Usage

See [action.yml](action.yml) for inputs and outputs.

```yaml
- uses: port-labs/port-github-action@v1
  with:
    clientId: ${{ secrets.CLIENT_ID }}
    clientSecret: ${{ secrets.CLIENT_SECRET }}
    operation: UPSERT
    identifier: port-github-action
    title: Port Github Action
    blueprint: PortIntegration
    properties: |
      {
        "version": "v1"
      }
    team: Port
    relations: |
      {
        "deployedAt": "prod"
      }
```
