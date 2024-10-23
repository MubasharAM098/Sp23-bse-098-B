$(document).ready(function () {
    const apiUrl = 'https://usmanlive.com/wp-json/api/stories';

    // Fetch and display all stories
    function fetchStories() {
        $.ajax({
            url: apiUrl,
            method: 'GET',
            success: function (data) {
                $('#storiesList').empty();
                data.forEach(function (story) {
                    $('#storiesList').append(`
                        <div class="card mb-3" data-id="${story.id}">
                            <div class="card-body">
                                <h5 class="card-title">${story.title}</h5>
                                <p class="card-text">${story.content}</p>
                                <button class="btn btn-warning btn-sm edit-story">Edit</button>
                                <button class="btn btn-danger btn-sm delete-story">Delete</button>
                            </div>
                        </div>
                    `);
                });
            }
        });
    }

    // Initial fetch of stories
    fetchStories();

    // Add a new story
    $('#storyForm').submit(function (e) {
        e.preventDefault();
        const newStory = {
            title: $('#title').val(),
            content: $('#content').val()
        };

        $.ajax({
            url: apiUrl,
            method: 'POST',
            data: JSON.stringify(newStory),
            contentType: 'application/json',
            success: function () {
                $('#title').val('');
                $('#content').val('');
                fetchStories(); // Refresh the list
            }
        });
    });

    // Edit a story (show modal)
    $(document).on('click', '.edit-story', function () {
        const storyId = $(this).closest('.card').attr('data-id');
        const storyTitle = $(this).siblings('.card-title').text();
        const storyContent = $(this).siblings('.card-text').text();

        $('#editStoryModal').modal('show');
        $('#editStoryForm').attr('data-id', storyId);
        $('#editTitle').val(storyTitle);
        $('#editContent').val(storyContent);
    });

    // Save changes to a story
    $('#editStoryForm').submit(function (e) {
        e.preventDefault();
        const storyId = $(this).attr('data-id');
        const updatedStory = {
            title: $('#editTitle').val(),
            content: $('#editContent').val()
        };

        $.ajax({
            url: `${apiUrl}/${storyId}`,
            method: 'PUT',
            data: JSON.stringify(updatedStory),
            contentType: 'application/json',
            success: function () {
                $('#editStoryModal').modal('hide');
                fetchStories(); // Refresh the list
            }
        });
    });

    // Delete a story
    $(document).on('click', '.delete-story', function () {
        const storyId = $(this).closest('.card').attr('data-id');

        if (confirm('Are you sure you want to delete this story?')) {
            $.ajax({
                url: `${apiUrl}/${storyId}`,
                method: 'DELETE',
                success: function () {
                    fetchStories(); // Refresh the list
                }
            });
        }
    });
});
