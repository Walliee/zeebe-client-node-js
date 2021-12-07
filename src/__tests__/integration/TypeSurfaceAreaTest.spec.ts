import { ZBClient, ZBWorkerTaskHandler } from '../../index'

process.env.ZEEBE_NODE_LOG_LEVEL = process.env.ZEEBE_NODE_LOG_LEVEL || 'NONE'

test("Hasn't broken any public type contracts", async () => {
	const zbc = new ZBClient({
		loglevel: 'NONE',
	})
	const handler: ZBWorkerTaskHandler = (job, complete, worker) => {
		worker.log(job.bpmnProcessId)
		return complete.success()
	}
	zbc.createWorker('nope', handler)
	await zbc.close()
	expect(true).toBeTruthy()
})
