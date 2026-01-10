// Helper to getting all descendant category IDs recursively
const getDescendantCategoryIds = (categories, parentIds) => {
    let allIds = new Set(parentIds.map(id => parseInt(id)));
    let queue = [...parentIds];

    while (queue.length > 0) {
        const currentId = parseInt(queue.shift());

        // Find children of currentId
        const children = categories.filter(cat => cat.parentId === currentId);

        for (const child of children) {
            if (!allIds.has(child.id)) {
                allIds.add(child.id);
                queue.push(child.id);
            }
        }
    }

    return Array.from(allIds);
};

module.exports = {
    getDescendantCategoryIds
};
