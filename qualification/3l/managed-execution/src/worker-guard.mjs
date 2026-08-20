export function createEffectCanary() {
  let effects = 0
  return {
    fire() {
      effects += 1
    },
    count() {
      return effects
    },
  }
}

export async function unguardedHandler(job, canary) {
  canary.fire()
  return { status: 'effect-fired', ownerJobRunId: job.data?.ownerJobRunId ?? null }
}

export async function guardedHandler(job, canary, ownerReader) {
  const ownerId = job.data?.ownerJobRunId
  const owner = ownerId ? await ownerReader(ownerId) : null
  if (!owner || owner.admissible !== true) {
    return { status: 'refused', reason: 'OWNER_NOT_ADMISSIBLE' }
  }

  canary.fire()
  return { status: 'effect-fired', ownerJobRunId: owner.id }
}
