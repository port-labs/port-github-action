<img align="right" width="100" height="74" src="https://cdn.prod.website-files.com/622996415264e2107087774c/65b09e2a73ab4ac42ad0c139_logo.svg" />

# Port GitHub Action

[![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)](https://port-community.slack.com/signup#/domain-signup)

Port is an open, flexible internal developer portal that enables platform teams to streamline everything developers need to know to be productive, reduces cognitive load on developers, and guide them along your golden paths. Start free at [port.io](https://port.io/).

This Port GitHub Action allows you to automatically keep your Port software catalog up-to-date. You can create, read, update, and delete entities in Port, directly from your GitHub workflows. 

### Docs

- [Port Docs](https://docs.getport.io/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/)

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
    team: '["Port"]'
    relations: |
      {
        "deployedAt": "prod"
      }
```
