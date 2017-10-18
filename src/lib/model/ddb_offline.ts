import { AWSError, DynamoDB, Request } from 'aws-sdk'
import { existsSync, readFileSync } from 'fs'
import { filter, find, map, values } from 'lodash'

/**
 * convenience type imports / aliases
 */
export type GetItemInput = DynamoDB.DocumentClient.GetItemInput
export type GetItemOutput = DynamoDB.DocumentClient.GetItemOutput
export type GetItemCallback = (err: AWSError, data: GetItemOutput) => void
export type GetItemResponse = Request<GetItemOutput, AWSError>

export type PutItemInput = DynamoDB.DocumentClient.PutItemInput
export type PutItemOutput = DynamoDB.DocumentClient.PutItemOutput
export type PutItemCallback = (err: AWSError, data: PutItemOutput) => void
export type PutItemResponse = Request<PutItemOutput, AWSError>

export type QueryInput = DynamoDB.DocumentClient.QueryInput
export type QueryOutput = DynamoDB.DocumentClient.QueryOutput
export type QueryCallback = (err: AWSError, data: QueryOutput) => void
export type QueryResponse = Request<QueryOutput, AWSError>

// local wrapper for testing
export default class DynamoDBClient {
  private tables: { [tableName: string]: any[] } = {}

  constructor() {
    // this.mockServerlessYaml()
    // this.seed()
  }

  get(params: GetItemInput, cb?: GetItemCallback): GetItemResponse {
    const table = this.getTable(params.TableName)
    const key = Object.keys(params.Key)[0]
    const value = params.Key[key]
    const result = find(table, item => item[key] === value)
    return this.wrapResponse({ Item: result })
  }

  put(params: PutItemInput, cb?: PutItemCallback): PutItemResponse {
    const table = this.getTable(params.TableName)
    table.push(params.Item)
    return this.wrapResponse({ Item: params.Item })
  }

  // query expression defaults to '=' for now
  query(params: QueryInput, cb?: QueryCallback): QueryResponse {
    const table = this.getTable(params.TableName)
    const keyName = Object.keys(params.ExpressionAttributeNames)[0]
    const key = params.ExpressionAttributeNames[keyName]
    const valueName = Object.keys(params.ExpressionAttributeValues)[0]
    const value = params.ExpressionAttributeValues[valueName]
    const result = filter(table, item => item[key] === value)
    return this.wrapResponse({ Items: result })
  }

  /**
   * private helpers for bootstrapping
   */

  private getTable(name: string): any {
    if (!this.tables[name]) {
      this.tables[name] = []
    }
    return this.tables[name]
  }

  private wrapResponse(input: any): any {
    return {
      promise() {
        return new Promise(resolve => resolve(input))
      },
    }
  }
}