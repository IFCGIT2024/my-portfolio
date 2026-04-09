const orderingChallengeBank = {
    heap: {
        label: 'Heap Operations',
        items: [
            {
                title: 'Insert 100 into a max heap',
                difficulty: 'easy',
                steps: [
                    'Insert 100 at the next open leaf position to preserve complete-tree structure.',
                    'Compare 100 with its parent.',
                    'If 100 is larger, swap with the parent.',
                    'Repeat compare-and-swap while the parent is smaller.',
                    'Stop when parent is greater/equal or node becomes root.'
                ]
            },
            {
                title: 'DeleteMax from a max heap',
                difficulty: 'easy',
                steps: [
                    'Remove the root (maximum value).',
                    'Move the last leaf to the root.',
                    'Compare the root with both children.',
                    'Swap with the larger child if needed.',
                    'Continue sifting down until heap order is restored.'
                ]
            },
            {
                title: 'Heap Sort using max-heap',
                difficulty: 'medium',
                steps: [
                    'Insert all values into a max heap.',
                    'Repeatedly call DeleteMax.',
                    'Append each removed max to output sequence.',
                    'Continue until heap is empty.',
                    'Final output is in descending sorted order.'
                ]
            }
        ]
    },
    bst: {
        label: 'BST Operations',
        items: [
            {
                title: 'Search for key k in BST',
                difficulty: 'easy',
                steps: [
                    'Start at the root.',
                    'If current key equals k, return found.',
                    'If k is smaller, move to left child.',
                    'If k is larger, move to right child.',
                    'If you reach null, key is not in the BST.'
                ]
            },
            {
                title: 'Delete node with two children in BST',
                difficulty: 'hard',
                steps: [
                    'Locate the node to delete.',
                    'Find inorder successor (minimum in right subtree).',
                    'Copy successor value into target node.',
                    'Delete the successor node from right subtree.',
                    'Reconnect links so BST property remains valid.'
                ]
            }
        ]
    },
    hashing: {
        label: 'Hash Tables',
        items: [
            {
                title: 'Insert with linear probing',
                difficulty: 'easy',
                steps: [
                    'Compute initial index using hash function.',
                    'If slot is empty, insert key/value there.',
                    'If occupied, check next slot (index + 1).',
                    'Wrap around at table end if needed.',
                    'Insert at the first available slot found.'
                ]
            },
            {
                title: 'Rehash when load factor too high',
                difficulty: 'medium',
                steps: [
                    'Detect load factor exceeds threshold.',
                    'Allocate a larger table.',
                    'Recompute hash index for each existing key.',
                    'Insert each key into new table using collision policy.',
                    'Replace old table reference with new table.'
                ]
            }
        ]
    },
    traversal: {
        label: 'Tree Traversals',
        items: [
            {
                title: 'Preorder traversal',
                difficulty: 'easy',
                steps: [
                    'Visit current node.',
                    'Traverse left subtree recursively.',
                    'Traverse right subtree recursively.'
                ]
            },
            {
                title: 'Inorder traversal',
                difficulty: 'easy',
                steps: [
                    'Traverse left subtree recursively.',
                    'Visit current node.',
                    'Traverse right subtree recursively.'
                ]
            },
            {
                title: 'Postorder traversal',
                difficulty: 'easy',
                steps: [
                    'Traverse left subtree recursively.',
                    'Traverse right subtree recursively.',
                    'Visit current node.'
                ]
            }
        ]
    }
};
