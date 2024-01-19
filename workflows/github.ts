import { Octokit } from '@octokit/action'
import github from '@actions/github'
import assert from 'node:assert/strict'

export async function commentOnPr(message: string) {
  const octokit = new Octokit()
  assert(github.context.eventName === 'pull_request', 'Not a PR')
  try {
    await octokit.issues.createComment({
      ...github.context.repo,
      issue_number: github.context.payload.pull_request!.number,
      body: message,
    })
  } catch (error) {
    console.error('You may be on a fork. Commenting is not allowed.')
    throw error
  }
}

export function branchOnPr(): string {
  // On GitHub Actions, PR and tag are not to be checked out into a branch, but "detached HEAD".
  // Only push is checked out into a branch.
  // So, not calling git.branch(), but `github.context.payload.pull_request!.head.ref`
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return github.context.payload.pull_request!.head.ref as string
}

export function isPr(): boolean {
  return github.context.eventName === 'pull_request'
}

export function prNumber(): number {
  assert(isPr(), 'Not a PR')
  return github.context.payload.pull_request!.number
}

export function isPushToMain(): boolean {
  return github.context.ref === 'refs/heads/main'
}
