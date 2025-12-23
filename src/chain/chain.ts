import { flatFilter, FilterQuery } from '../filter/filter';

interface Chain<T> {
  /**
   * Add a filtering step to the pipeline.
   * This is lazy: it doesn't execute until you call .value()
   */
  filter(query: FilterQuery): Chain<T>;
  
  /**
   * Execute the pipeline and return the resulting array.
   * Optimizes multiple filter steps into a single pass.
   */
  value(): T[];
}

export function flatChain<T>(data: T[]): Chain<T> {
  // We store the queries here instead of running them immediately
  const queries: FilterQuery[] = [];

  return {
    filter(query: FilterQuery) {
      queries.push(query);
      return this; // Return self for fluent chaining
    },

    value() {
      // Optimization 1: No queries? Return original data
      if (queries.length === 0) {
        return data;
      }

      // Optimization 2: One query? Run it directly
      if (queries.length === 1) {
        return flatFilter(data, queries[0]);
      }

      // Optimization 3: Multiple queries? Combine into a single $and
      // This ensures we iterate the array ONLY ONCE
      const combinedQuery: FilterQuery = {
        $and: queries
      };

      return flatFilter(data, combinedQuery);
    }
  };
}
