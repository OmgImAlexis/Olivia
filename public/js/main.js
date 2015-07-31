$(document).ready(function(){
    $.timeago.settings.allowPast = true;
    $.timeago.settings.allowFuture = true;
    $('[datetime]').timeago();
});
