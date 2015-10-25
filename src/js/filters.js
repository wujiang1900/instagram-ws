(function() {
'use strict';

angular.module('instApp')
.filter('dateInMilliSec', function () {
    return function (val) {
        if (val === undefined) return 0;
        if (val) {
            if (_.isArray(val)) {
                val = new Date(val[0], val[1]-1, val[2]); //month beginning with 0 for January to 11 for December.
            } else {
                return new moment(val).unix() * 1000;
            }
        }
        return val.getTime();
    };
});
})();