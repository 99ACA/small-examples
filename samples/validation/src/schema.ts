import 'reflect-metadata'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsUUID, IsEnum, ValidateNested, Matches, ValidateIf, IsEmpty, IsIn, IsString } from 'class-validator'

export enum ActionType {
    Sample = "Sample"
}

export class PublishResponse {

    @IsString()
    @IsIn(['S3', 's3', 'sqs', 'SQS'])
    type: string

    @ValidateIf(obj => !!obj.region)
    @IsString()
    @IsIn(['us-east-2', 'us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-south-1', 'eu-west-3', 'eu-north-1', 'me-south-1'])
    region?: string

    @IsNotEmpty()
    name: string

    @ValidateIf(obj => !['s3', 'S3'].includes(obj.type))
    @IsEmpty({ message: "The location attribute is only relevant to S3" })
    location?: string
}

export class IncomingRequest<T extends {} = {}> {

    @IsEnum(ActionType)
    action: ActionType

    @IsNotEmpty()
    @IsUUID()
    correlationId: string

    @ValidateIf(obj => !!obj.publish)
    @ValidateNested()
    @Type(() => PublishResponse)
    publish?: PublishResponse

    @IsNotEmpty()
    payload: T
}

