## 2025-05-15 - [React/Zustand] Unnecessary re-renders and inefficient state synchronization
**Learning:** In applications using global state managers like Zustand, components subscribing to the entire state object without selectors will re-render on every state change, even unrelated ones. Furthermore, synchronizing local component state (like TanStack Table selection) with global state using multiple individual updates in a loop creates an O(N*M) performance bottleneck and triggers excessive re-renders.
**Action:** Always use granular selectors and `useShallow` when consuming Zustand stores. For state synchronization, implement batch update actions in the store to perform O(N) updates instead of multiple O(1) updates. Use stable row IDs (like database primary keys) in table libraries to simplify mapping.

## 2025-05-20 - [Octokit] Excessive memory usage in repository listing
**Learning:** GitHub's repository objects are extremely verbose, containing dozens of fields. Fetching and storing thousands of full objects via `octokit.paginate` can lead to significant memory consumption and slow down client-side processing.
**Action:** Use the `mapFn` argument in `octokit.paginate` to prune objects down to essential fields defined in the `Repository` interface at the point of ingestion. This reduces memory footprint and improves overall application performance.

## 2025-05-25 - [React] Redundant prop drilling and O(N) searches in modals
**Learning:** Passing large collections to multiple modals that then perform their own O(N) searches creates redundant computations and triggers unnecessary re-renders across all modals whenever the collection changes. Lifting the lookup (O(1) via Map) to the parent component and passing specific targets as props isolates modals and improves UI responsiveness.
**Action:** Perform lookups in the parent component using a memoized Map. Pass only the required entity or a subset to child modals. This ensures that modals only re-render when their specific target data changes, not on every list update.
