export interface IQueueProducer<T = any> {
    addJob(data: T): Promise<string>;
    getJobStatus(jobId: string): Promise<any>;
}
