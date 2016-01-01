/**
 * Created by sercan on 30.12.2015.
 */
Template.find.onRendered(function () {
    Template.initializeAceEditor('aceSelector', Template.find.executeQuery);
    Template.find.initializeOptions();
});


Template.find.initializeOptions = function () {
    var cmb = $('#cmbFindCursorOptions');
    $.each(CURSOR_OPTIONS, function (key, value) {
        cmb.append($("<option></option>")
            .attr("value", key)
            .text(value));
    });

    cmb.chosen();
    Template.setOptionsComboboxChangeEvent(cmb);
};

Template.find.executeQuery = function () {
    var laddaButton = Template.browseCollection.initExecuteQuery();
    var connection = Connections.findOne({_id: Session.get(Template.strSessionConnection)});
    var selectedCollection = Session.get(Template.strSessionSelectedCollection);
    var cursorOptions = Template.find.getCursorOptions();
    var selector = ace.edit("aceSelector").getSession().getValue();

    if (!selector) {
        selector = {};
    }
    else {
        try {
            selector = JSON.parse(selector);
        }
        catch (err) {
            toastr.error("Syntax error on selector: " + err.message);
            laddaButton.ladda('stop');
            return;
        }
    }

    if (cursorOptions["ERROR"]) {
        toastr.error(cursorOptions["ERROR"]);
        laddaButton.ladda('stop');
        return;
    }

    Meteor.call("find", connection, selectedCollection, selector, cursorOptions, function (err, result) {
        if (err || result.error) {
            var errorMessage;
            if (err) {
                errorMessage = err.message;
            } else {
                errorMessage = result.error.message;
            }
            toastr.error("Couldn't execute query: " + errorMessage);
            // stop loading animation
            laddaButton.ladda('stop');
            return;
        }

        Template.browseCollection.setResult(result.result);
        // stop loading animation
        laddaButton.ladda('stop');
    });
};

Template.find.getCursorOptions = function () {
    var result = {};
    Template.checkAceEditorOption("PROJECT", "aceProject", result, CURSOR_OPTIONS);
    Template.checkAceEditorOption("MAX", "aceMax", result, CURSOR_OPTIONS);
    Template.checkAceEditorOption("MIN", "aceMin", result, CURSOR_OPTIONS);
    Template.checkAceEditorOption("SORT", "aceSort", result, CURSOR_OPTIONS);

    if ($.inArray("SKIP", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var skipVal = $('#inputSkip').val();
        if (skipVal) {
            result[CURSOR_OPTIONS.SKIP] = parseInt(skipVal);
        }
    }

    if ($.inArray("LIMIT", Session.get(Template.strSessionSelectedOptions)) != -1) {
        var limitVal = $('#inputLimit').val();
        if (limitVal) {
            result[CURSOR_OPTIONS.LIMIT] = parseInt(limitVal);
        }
    }

    return result;
};