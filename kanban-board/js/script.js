var COLUMN_TYPE = ['todo', 'doing', 'done'];
var DOING_LIMIT = 3;

var DB = {
    getData: function () {
        if (typeof(Storage) !== "undefined") {
            var data;

            try {
                data = JSON.parse(localStorage.getItem('list')) || {};
                COLUMN_TYPE.forEach(function (type) {
                    if (!Array.isArray(data[type])) data[type] = [];
                });
            } catch (e) {
                data = {};
            }

            return data;
        } else {
            alert('Sorry! Your browser is too old to use this application.');
            return {};
        }
    },
    setData: function (data) {
        localStorage.setItem('list', JSON.stringify(data));
    }
};

var Util = {
    showLoading: function () {
        $('.overlay').removeClass('hidden');
    },
    hideLoading: function () {
        $('.overlay').addClass('hidden');
    },
    openAlertModal: function () {
        $('#modal-alert').openModal();
    },
    openConfirmModal: function () {
        $('#modal-confirm').openModal();
    },
    closeConfirmModal: function () {
        $('#modal-confirm').closeModal();
    }
};

var list = DB.getData();

var app = {
    init: function () {
        var self = this;

        // Add job to lists
        COLUMN_TYPE.forEach(function (type) {
            var columnType = list[type] || [];
            columnType.forEach(function (jobName) {
                self.addJobToList(type, jobName);
            });
        });

        // Init sortable
        this.sortJob();

        // Hide loading
        Util.hideLoading();
    },
    sortJob: function () {
        var self = this;

        $('.sorted-list').sortable({
            connectWith: '.sorted-list',
            placeholder: 'ui-state-highlight',
            start: function (event, ui) {
                // Add style class
                $(ui.item[0]).addClass('dragging');

                // Set column and position
                ui.item.oldColumnType = ui.item.context.parentElement.getAttribute('id');
                ui.item.oldItemPosition = ui.item.index();
            },
            stop: function (event, ui) {
                // Remove style class
                $(ui.item[0]).removeClass('dragging');

                // Get old and new column
                var item = ui.item;
                var oldItemPosition = item.oldItemPosition;
                var oldColumnType = item.oldColumnType;
                var newColumnType = item.context.parentElement.getAttribute('id');

                if (newColumnType == 'doing' && list[newColumnType].length >= DOING_LIMIT) {
                    $('.sorted-list').sortable('cancel');
                    Util.openAlertModal();
                } else {
                    // Remove Item from old position
                    list[oldColumnType].splice(oldItemPosition, 1);
                    self.updateJobCount(oldColumnType);

                    // Add item to new position
                    list[newColumnType].splice(item.index(), 0, item[0].innerText);
                    self.updateJobCount(newColumnType);

                    // Store data to local storage
                    DB.setData(list);
                }
            }
        });
    },
    newJob: function (e, type, input) {
        var jobName = $(input).val();

        // Get event onkeydown
        var event = window.event || e;

        // Check key press is Enter (code = 13)
        if (event.keyCode === 13 && jobName !== "") {
            // Store data to local storage
            if (!list[type]) list[type] = [];

            // Limit doing job
            if (type == 'doing' && list[type].length >= DOING_LIMIT) {
                Util.openAlertModal();
            } else {
                list[type].push(jobName);
                DB.setData(list);

                // Update DOM
                this.addJobToList(type, jobName);
            }

            // Reset input
            $(input).val('');
        }
    },
    addJobToList: function (type, jobName) {
        // Convert HTML entities
        var tmp = $('<div></div>');
        tmp.text(jobName);

        // Append item to list
        var item = '<div class="collection-item"> ' + tmp.html() +
            '<span class="badge" onclick="app.deleteJob(this)"><i class="tiny material-icons">delete</i></span>' +
            '</div>';
        $('#' + type).append(item);

        // Update count of job
        this.updateJobCount(type);
    },
    deleteJob: function (span) {
        var btnDelete = $('#btn-delete');
        var self = this;

        Util.openConfirmModal();

        // Unbind old event on Agree button
        btnDelete.off('click');

        // Bind new event onclick on Agree button
        btnDelete.on('click', function () {
            var item = $(span).parent();
            var columnType = item.parent().attr('id');
            var itemPosition = $('#' + columnType + ' .collection-item').index(item);

            // Remove item from list
            list[columnType].splice(itemPosition, 1);
            DB.setData(list);

            // Remove item form DOM and update count
            item.remove();
            self.updateJobCount(columnType);

            Util.closeConfirmModal();
        })
    },
    updateJobCount: function (type) {
        $('#' + type).prev('h5').children('.count').text('(' + list[type].length + ')');
    }
};

$(function () {
    app.init();
});