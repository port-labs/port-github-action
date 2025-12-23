# Contributing to Port GitHub Action

## Development

### Building the Project

Before submitting a pull request, make sure to build and package the project:

```bash
npm run build
npm run package
```

These commands are **essential** and must be run before committing your changes to `main`:

- `npm run build` - Compiles the TypeScript code
- `npm run package` - Bundles the code for distribution using `ncc`

### Making Changes

1. Create a new branch for your changes
2. Make your code changes
3. Run tests: `npm test`
4. Run build and package: `npm run build && npm run package`
5. Commit your changes including the updated `dist/` directory
6. Push your branch and create a pull request

## Testing the Action Before Merging

Before merging your PR, you should test the action in a real GitHub workflow. To do this:

1. Get your commit SHA using `git log` or from the GitHub UI
2. Use the commit SHA in your workflow file instead of a version tag

Here's an example workflow that tests the action using commit SHA `abc123`:

```yml
run-name: ${{ github.actor }} is testing out GitHub Actions 🚀

on:
  workflow_dispatch:
    inputs:
      run_id:
        required: false
        description: "Run ID"
        type: string

jobs:
  upsert:
    runs-on: ubuntu-latest
    steps:
      - name: Create entity
        uses: port-labs/port-github-action@abc123
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          blueprint: 'test'
          identifier: '${{ inputs.run_id }}-entity'
          runId: ${{ inputs.run_id }}
```

Replace `abc123` with your actual commit SHA. This allows you to test your changes in a real workflow environment before merging.

## Release Process

This project uses [tagpr](https://github.com/Songmu/tagpr) for automated releases. The release flow works as follows:

1. **Merge your PR** - Once your pull request is reviewed and approved, merge it to the main branch
2. **Automated PR creation** - An action is triggered automatically that creates a release PR with:
   - Updated version numbers
   - Changelog updates
   - Tag preparation
3. **Release publication** - When the release PR is merged, it automatically:
   - Creates a new GitHub release
   - Updates existing version tags (e.g., `v1`, `v1.1`)
   - Publishes the new version

### tagpr Configuration

The `.tagpr` file in the root directory configures the automated release behavior. This ensures consistent versioning and changelog management across releases.
