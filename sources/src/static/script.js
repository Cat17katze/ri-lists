document.addEventListener("DOMContentLoaded", () => {
    const listSelectionDiv = document.getElementById("list-selection");
    const listDetailsDiv = document.getElementById("list-details");
    const createListFormDiv = document.getElementById("create-list-form");
    const listsUl = document.getElementById("lists-ul");
    const itemsUl = document.getElementById("items-ul");
    const currentListTitleH2 = document.getElementById("current-list-title");
    const showCreateListFormBtn = document.getElementById("show-create-list-form-btn");
    const createListBtn = document.getElementById("create-list-btn");
    const cancelCreateListBtn = document.getElementById("cancel-create-list-btn");
    const newListTitleInput = document.getElementById("new-list-title");
    const addItemForm = document.getElementById("add-item-form");
    const newItemTitleInput = document.getElementById("new-item-title");
    const newItemDetailsTextarea = document.getElementById("new-item-details");
    const backToListsBtn = document.getElementById("back-to-lists-btn");
    const deleteCurrentListBtn = document.getElementById("delete-current-list-btn");

    let currentList = null; // Store the currently viewed list data

    // --- API Helper Functions ---
    async function fetchLists() {
        try {
            const response = await fetch("/api/lists");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching lists:", error);
            alert("Failed to load lists.");
            return [];
        }
    }

    async function fetchListDetails(listId) {
        try {
            const response = await fetch(`/api/lists/${listId}`);
            if (!response.ok) {
                if (response.status === 404) return null; // Not found
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching list ${listId}:`, error);
            alert(`Failed to load list details for ${listId}.`);
            return null;
        }
    }

    async function createList(title) {
        try {
            const response = await fetch("/api/lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title })
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error creating list:", error);
            alert("Failed to create list.");
            return null;
        }
    }

    async function updateList(listData) {
        try {
            const response = await fetch(`/api/lists/${listData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(listData)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error updating list ${listData.id}:`, error);
            alert("Failed to update list.");
            return null;
        }
    }

    async function deleteList(listId) {
        try {
            const response = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
            if (!response.ok && response.status !== 204) throw new Error(`HTTP error! status: ${response.status}`);
            return true; // Success (204 No Content)
        } catch (error) {
            console.error(`Error deleting list ${listId}:`, error);
            alert("Failed to delete list.");
            return false;
        }
    }

    // --- UI Update Functions ---
    function displayLists(lists) {
        listsUl.innerHTML = ""; // Clear existing lists
        if (!lists || lists.length === 0) {
            listsUl.innerHTML = "<li>No lists found. Create one!</li>";
            return;
        }
        lists.forEach(list => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${escapeHTML(list.title)}</span>
                <div class="list-item-controls">
                    <button class="view-btn" data-id="${list.id}">View</button>
                    <button class="delete-list-btn" data-id="${list.id}">Delete</button>
                </div>
            `;
            listsUl.appendChild(li);
        });
    }

    function displayListDetails(listData) {
        currentList = listData;
        currentListTitleH2.textContent = escapeHTML(listData.title);
        itemsUl.innerHTML = ""; // Clear existing items

        if (!listData.items || listData.items.length === 0) {
            itemsUl.innerHTML = "<li>No items in this list yet.</li>";
        }
        listData.items.forEach(item => {
            renderItem(item);
        });

        // Show details, hide selection/create form
        listSelectionDiv.classList.add("hidden");
        createListFormDiv.classList.add("hidden");
        listDetailsDiv.classList.remove("hidden");
    }

    function renderItem(item, isEditing = false) {
        const li = document.createElement("li");
        li.setAttribute("data-id", item.id);

        if (isEditing) {
            li.innerHTML = `
                <div style="width: 100%;">
                    <input type="text" class="edit-item-title" value="${escapeHTML(item.title)}" style="width: 95%; margin-bottom: 5px;">
                    <textarea class="edit-item-details" style="width: 95%; height: 60px;">${escapeHTML(item.details)}</textarea>
                </div>
                <div class="item-controls">
                    <button class="save-item-btn" data-id="${item.id}">Save</button>
                    <button class="cancel-edit-btn" data-id="${item.id}">Cancel</button>
                </div>
            `;
        } else {
            li.innerHTML = `
                <div>
                    <strong>${escapeHTML(item.title)}</strong>
                    <div class="item-details">${escapeHTML(item.details)}</div>
                </div>
                <div class="item-controls">
                    <button class="edit-item-btn" data-id="${item.id}">Edit</button>
                    <button class="delete-item-btn" data-id="${item.id}">Delete</button>
                </div>
            `;
        }
        // Find existing li if it exists, otherwise append
        const existingLi = itemsUl.querySelector(`li[data-id="${item.id}"]`);
        if (existingLi) {
            itemsUl.replaceChild(li, existingLi);
        } else {
            itemsUl.appendChild(li);
        }
    }

    function showListSelection() {
        currentList = null;
        listDetailsDiv.classList.add("hidden");
        createListFormDiv.classList.add("hidden");
        listSelectionDiv.classList.remove("hidden");
        loadLists(); // Refresh list view
    }

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- Event Handlers ---
    showCreateListFormBtn.addEventListener("click", () => {
        listSelectionDiv.classList.add("hidden");
        createListFormDiv.classList.remove("hidden");
        newListTitleInput.value = "";
        newListTitleInput.focus();
    });

    cancelCreateListBtn.addEventListener("click", () => {
        createListFormDiv.classList.add("hidden");
        listSelectionDiv.classList.remove("hidden");
    });

    createListBtn.addEventListener("click", async () => {
        const title = newListTitleInput.value.trim();
        if (!title) {
            alert("List title cannot be empty.");
            return;
        }
        const newList = await createList(title);
        if (newList) {
            showListSelection(); // Go back and refresh list
        }
    });

    listsUl.addEventListener("click", async (event) => {
        const target = event.target;
        const listId = target.getAttribute("data-id");

        if (target.classList.contains("view-btn")) {
            const listData = await fetchListDetails(listId);
            if (listData) {
                displayListDetails(listData);
            }
        } else if (target.classList.contains("delete-list-btn")) {
            if (confirm("Are you sure you want to delete this list and all its items?")) {
                const success = await deleteList(listId);
                if (success) {
                    loadLists(); // Refresh the list view
                }
            }
        }
    });

    backToListsBtn.addEventListener("click", showListSelection);

    deleteCurrentListBtn.addEventListener("click", async () => {
        if (currentList && confirm(`Are you sure you want to delete the list "${currentList.title}"?`)) {
            const success = await deleteList(currentList.id);
            if (success) {
                showListSelection();
            }
        }
    });

    addItemForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!currentList) return;

        const title = newItemTitleInput.value.trim();
        const details = newItemDetailsTextarea.value.trim();

        if (!title) {
            alert("Item title cannot be empty.");
            return;
        }

        const newItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Simple unique ID
            title: title,
            details: details
        };

        currentList.items.push(newItem);
        const updatedList = await updateList(currentList);

        if (updatedList) {
            // Re-render the specific item or the whole list
            renderItem(newItem);
            // Clear the form
            newItemTitleInput.value = "";
            newItemDetailsTextarea.value = "";
        } else {
            // Revert optimistic update if API call failed
            currentList.items.pop();
        }
    });

    itemsUl.addEventListener("click", async (event) => {
        const target = event.target;
        const itemId = target.getAttribute("data-id");
        const li = target.closest("li");
        if (!itemId || !currentList || !li) return;

        if (target.classList.contains("delete-item-btn")) {
            if (confirm("Are you sure you want to delete this item?")) {
                currentList.items = currentList.items.filter(item => item.id !== itemId);
                const updatedList = await updateList(currentList);
                if (updatedList) {
                    li.remove(); // Remove from UI
                } else {
                    // Revert if failed (could re-fetch list for consistency)
                    alert("Failed to delete item.");
                    // Potentially reload the list details here
                    const freshList = await fetchListDetails(currentList.id);
                    if (freshList) displayListDetails(freshList);
                }
            }
        } else if (target.classList.contains("edit-item-btn")) {
            const item = currentList.items.find(i => i.id === itemId);
            if (item) {
                renderItem(item, true); // Re-render the item in edit mode
            }
        } else if (target.classList.contains("cancel-edit-btn")) {
            const item = currentList.items.find(i => i.id === itemId);
            if (item) {
                renderItem(item, false); // Re-render the item in view mode
            }
        } else if (target.classList.contains("save-item-btn")) {
            const editTitleInput = li.querySelector(".edit-item-title");
            const editDetailsTextarea = li.querySelector(".edit-item-details");
            const newTitle = editTitleInput.value.trim();
            const newDetails = editDetailsTextarea.value.trim();

            if (!newTitle) {
                alert("Item title cannot be empty.");
                return;
            }

            const itemIndex = currentList.items.findIndex(i => i.id === itemId);
            if (itemIndex > -1) {
                const originalItem = { ...currentList.items[itemIndex] }; // Store original for potential revert
                currentList.items[itemIndex].title = newTitle;
                currentList.items[itemIndex].details = newDetails;

                const updatedList = await updateList(currentList);
                if (updatedList) {
                    renderItem(currentList.items[itemIndex], false); // Re-render in view mode
                } else {
                    // Revert changes if API call failed
                    currentList.items[itemIndex] = originalItem;
                    renderItem(originalItem, false); // Re-render original in view mode
                    alert("Failed to save item changes.");
                }
            }
        }
    });

    // --- Initial Load ---
    async function loadLists() {
        const lists = await fetchLists();
        displayLists(lists);
    }

    loadLists(); // Load lists when the page loads
});

