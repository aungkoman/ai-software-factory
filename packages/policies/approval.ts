export const requiresHumanApproval = (action: string): boolean => ['merge','production-deploy','destructive-migration','security-policy-change'].includes(action);
