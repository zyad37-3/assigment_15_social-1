import mongoose, {
    DeleteResult, FlattenMaps, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, QueryOptions,
    UpdateQuery, UpdateWithAggregationPipeline, UpdateWriteOpResult
} from "mongoose";
import { HydratedDocument, QueryFilter } from "mongoose";
import { AnyKeys, Model, CreateOptions } from "mongoose";
import { IPaginate } from "../interface/paginate.interface";

export abstract class DataBaseRepository<TRawDocType> {
    constructor(protected model: Model<TRawDocType>) {

    }
    //CREATE
    //Prototype || Overloading==>Methods مع Objects تانية انها تشارك الخصائص والـ Objects هو نظام بيسمح لل
    async create({ data }: { data: AnyKeys<TRawDocType> }): Promise<HydratedDocument<TRawDocType>>
    async create({ data, options }: { data: AnyKeys<TRawDocType>[]; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType>[]>
    async create({ data, options }: { data: AnyKeys<TRawDocType> | AnyKeys<TRawDocType>[]; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType> | HydratedDocument<TRawDocType>[]> {
        return await this.model.create(data as any, options)
    }
    async createOne({ data, options = {} }: { data: AnyKeys<TRawDocType>; options?: CreateOptions }): Promise<HydratedDocument<TRawDocType>> {
        const [doc] = await this.create({ data: [data], options })
        return doc as HydratedDocument<TRawDocType>
    }

    //FINDS
    async findOne({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options: QueryOptions<TRawDocType> & { lean: true } | null | undefined
    }): Promise<FlattenMaps<TRawDocType> | undefined | null>
    async findOne({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options: QueryOptions<TRawDocType> & { lean: false } | null | undefined
    }): Promise<HydratedDocument<TRawDocType> | undefined | null>
    async findOne({
        filter,
        projection,
        options
    }: {
        filter: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType> | null | undefined
    }): Promise<HydratedDocument<TRawDocType> | undefined | null>
    async findOne({
        filter = {},
        projection,
        options
    }: {
        filter: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType> | null | undefined
    }): Promise<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | undefined | null> {

        const doc = this.model.findOne(filter, projection)
        if (options?.populate) {
            doc?.populate(options.populate as PopulateOptions[])
        }
        if (options?.lean !== undefined) {
            doc?.lean(options.lean)
        }
        return await doc.exec()

    }

    //FIND_BY_ID
    async findById({
        id,
        projection,
        options
    }: {
        id: mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options: QueryOptions<TRawDocType> & { lean: true }
    }): Promise<FlattenMaps<TRawDocType> | null>
    async findById({
        id,
        projection,
        options
    }: {
        id: mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType> & { lean?: false } | null
    }): Promise<HydratedDocument<TRawDocType> | null>
    async findById({
        id,
        projection,
        options
    }: {
        id: mongoose.Types.ObjectId,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType> & { lean?: boolean } | null | undefined
    }): Promise<HydratedDocument<TRawDocType> | FlattenMaps<TRawDocType> | null> {

        const doc = this.model.findById(id, projection)
        if (options?.populate) {
            doc?.populate(options.populate as PopulateOptions[])
        }
        if (options?.lean) {
            doc?.lean(options.lean)
        }
        return await doc.exec()

    }
    //FIND
    async   find({
        filter,
        options,
    }: {
        filter?: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType>
    }): Promise<HydratedDocument<TRawDocType>[]> {
        const doc = this.model.find(filter || {})
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[]);
        }
        if (options?.select) {
            doc.select(options.select);
        }
        if (options?.sort) {
            doc.sort(options.sort);
        }
        if (options?.skip) {
            doc.skip(options.skip);
        }

        if (options?.limit) {
            doc.limit(options.limit);
        }

        if (options?.lean) {
            doc.lean(options.lean);
        }
        return await doc.exec();
    }
    //countDocument
    async countDocument({
        filter = {},
    }: {
        filter?: QueryFilter<TRawDocType>,
    }): Promise<number> {
        return await this.model.countDocuments(filter)
    }
    //pagination
    async pagination({
        filter = {},
        options = {},
        page = 1,
        limit = 5

    }: {
        filter?: QueryFilter<TRawDocType>,
        projection?: ProjectionType<TRawDocType> | null | undefined,
        options?: QueryOptions<TRawDocType>,
        page: number,
        limit: number
    }): Promise<IPaginate<HydratedDocument<TRawDocType>>> {
        const skip = (page - 1) * limit
        const count = await this.countDocument({ filter })
        const pages = Math.ceil(count / limit)
        const docs = await this.find({
            filter,
            options: {
                skip,
                limit,
                ...options,
            }
        })
        return { count, pages, currentPage: page, limit, docs }
    }
    //insertMany
    async insertMany({data}:{data: AnyKeys<TRawDocType>[]}) {
        return await this.model.insertMany( data )
    }
    //update
    async updateOne({
        filter = {},
        update,
        options
    }: {
        filter: QueryFilter<TRawDocType>,
        update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
        options?: (MongooseUpdateQueryOptions<TRawDocType>) | null
    }): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(filter, update, options)
    }
    //updateMany
    async updateMany({
        filter = {},
        update,
        options
    }: {
        filter: QueryFilter<TRawDocType>,
        update: UpdateQuery<TRawDocType> | UpdateWithAggregationPipeline,
        options?: (MongooseUpdateQueryOptions<TRawDocType>) | null
    }): Promise<UpdateWriteOpResult> {
        return await this.model.updateMany(filter, update, options)
    }
    //findOneAndUpdate
    async findOneAndUpdate({
        filter = {},
        update,
        options
    }: {
        filter?: QueryFilter<TRawDocType>,
        update?: UpdateQuery<TRawDocType>,
        options?: QueryOptions<TRawDocType> | null
    }): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findOneAndUpdate(filter, update, {
            // متحدثه Document بيرجع
            returnDocument: "after",
            ...options
        })
    }
    //findByIdAndUpdate
    async findByIdAndUpdate({
        id,
        update,
        options
    }: {
        id: mongoose.Types.ObjectId,
        update?: UpdateQuery<TRawDocType>,
        options?: QueryOptions<TRawDocType> | null
    }): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findByIdAndUpdate(id, update, {
            // متحدثه Document بيرجع
            returnDocument: "after",
            ...options
        })
    }
    //delete
    async deleteOne({
        filter = {},
    }: {
        filter: QueryFilter<TRawDocType>,
    }): Promise<DeleteResult> {
        return await this.model.deleteOne(filter)
    }
    //updateMany
    async deleteMany({
        filter = {},
    }: {
        filter: QueryFilter<TRawDocType>,
    }): Promise<DeleteResult> {
        return await this.model.deleteMany(filter)
    }
    //findOneAndDelete
    async findOneAndDelete({
        filter = {},
    }: {
        filter?: QueryFilter<TRawDocType>,
    }): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findOneAndDelete(filter)
    }
    //findByIdAndDelete
    async findByIdAndDelete({
        id,
    }: {
        id: mongoose.Types.ObjectId,
    }): Promise<HydratedDocument<TRawDocType> | null> {
        return await this.model.findByIdAndDelete(id)
    }

} 