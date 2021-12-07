import * as uuid from 'uuid'
import { ZBClient } from '../../..'
import { createUniqueTaskType } from '../../../lib/createUniqueTaskType'

process.env.ZEEBE_NODE_LOG_LEVEL = process.env.ZEEBE_NODE_LOG_LEVEL || 'NONE'

let zbcLongPoll

jest.setTimeout(40000)

afterAll(async () => {
	await zbcLongPoll.close()
})

test('Does long poll by default', () =>
	new Promise(async done => {
		zbcLongPoll = new ZBClient({
			longPoll: 60000,
		})
		const { processId, bpmn } = createUniqueTaskType({
			bpmnFilePath: './src/__tests__/testdata/Worker-LongPoll.bpmn',
			messages: [],
			taskTypes: [],
		})
		const res = await zbcLongPoll.deployWorkflow({
			definition: bpmn,
			name: `worker-longPoll-${processId}.bpmn`,
		})
		expect(res.workflows.length).toBe(1)

		const worker = zbcLongPoll.createWorker(
			uuid.v4(),
			async (job, complete) => {
				await complete.success(job.variables)
			},
			{ loglevel: 'NONE', debug: true }
		)
		// Wait to outside 10s - it should have polled once when it gets the job
		setTimeout(async () => {
			expect(worker.pollCount).toBe(1)
			done(null)
		}, 35000)
	}))
