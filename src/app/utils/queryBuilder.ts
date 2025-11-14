import { Query } from "mongoose";
import { excludeFields } from "../constent";

export class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, string>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter(): this {
        const filter = { ...this.query };

        for (const field of excludeFields) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete filter[field];
        }

        this.modelQuery = this.modelQuery.find(filter);
        return this;
    }

    search(searchableFields: string[]): this {
        const searchTerm = this.query.searchTerm || "";
        const searchQuery = {
            $or: searchableFields.map((field) => ({
                [field]: { $regex: searchTerm, $options: "i" },
            })),
        };
        this.modelQuery = this.modelQuery.find(searchQuery);
        return this;
    }

    sort(): this {
        
        return this;
    }
}
