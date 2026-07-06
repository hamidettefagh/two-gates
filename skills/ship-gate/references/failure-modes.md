# Failure modes

Each dimension exists to catch a specific way agents fail in production. When you assess a dimension, these are the failures you are looking for evidence against.

## Evaluation catches: the silent regression

A prompt tweak that fixed one case quietly broke ten others. Without an eval set and automatic scoring, nobody notices until users do, and by then the change is three deploys back and hard to isolate. The tell: the team cannot answer "how do you know this change made it better?"

## Cost catches: the runaway bill

An agent gets into a loop, or traffic spikes, or a prompt grows over months, and the bill arrives at the end of the month with no warning. The tell: nobody can state the cost per resolved conversation, so nobody can see the trend before it is a problem.

## Observability catches: the unreproducible incident

A customer reports a bad interaction and the team cannot find it, or finds it but cannot see which tool call failed. The incident is real and unfixable because the evidence was never captured. The tell: "we would have to add logging to know."

## Guardrails catch: the agent talked into it

Someone gets the agent to do or say something outside its scope, leak data, or take an action it should have refused. In production this is not hypothetical; people try. The tell: the boundaries were described in the prompt but never tested against someone trying to break them.

## Human oversight catches: the confident wrong action

The agent does something irreversible while confidently wrong, and there was no human in the loop and no confirmation gate to catch it. The tell: high-impact actions run automatically, and low-confidence answers are delivered the same as high-confidence ones.

## Reliability catches: the change you cannot undo

A bad change ships, and rolling it back means a redeploy that takes hours while the agent misbehaves in front of users. Or a dependency goes down and the agent fails hard instead of degrading. The tell: config is not versioned, or nobody has ever tested a rollback.

## Governance catches: the question you cannot answer

Someone asks what the agent did with a customer's data, or who approved a change, or why it took an action, and the honest answer is "we do not know." In a regulated or high-trust setting this is the failure that ends the program. The tell: consequential actions are not audited, and access is not controlled.
