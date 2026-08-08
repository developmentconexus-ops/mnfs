export function buildExecutionAuthorizationToken({
  planGitBlob,
  contractHash,
  baseCommitSha,
  verificationRunId,
}) {
  return `MNFS_AUTHORIZE_ARR_S0_EXECUTE plan_blob=${planGitBlob} contract_sha256=${contractHash} base_sha=${baseCommitSha} verify_run=${verificationRunId} scope=canonical-host-probe-only`;
}
