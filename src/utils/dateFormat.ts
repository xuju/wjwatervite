import moment from "moment";

export default (function () {

    function getCurrIntTime() {
        let date = new Date();
        if (date.getMinutes() > 0 || date.getSeconds() > 0) {
            let date1 = new Date(date.setTime(date.getTime() + 60 * 60 * 1000));
            return `${date1.getFullYear()}-${date1.getMonth() + 1}-${date1.getDate()} ${date1.getHours()}:00`;
        } else {
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
        }
    }
    function getAfterDay() {
        let yesterday = `${moment().subtract(1, 'days').format('YYYY-MM-DD')} 08:00:00`;
        return yesterday;
    }
    function getDay() {
        let date = new Date();

        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00`;
    }
    function getYesterday8() {
        let date = new Date();
        date = new Date(date.setTime(date.getTime() - 24 * 60 * 60 * 1000));
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 08:00`;
    };
    function getDay8() {
        let date = new Date();
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 08:00`;
    };
    function getTomorrow8() {
        let date = new Date();
        date = new Date(date.getDate() + 1);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 08:00`;
    }
    function getLastWeek() {
        let date = new Date();
        date = new Date(date.setTime(date.getTime() - 7 * 24 * 60 * 60 * 1000));
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00`;
    }
    return {
        getCurrIntTime,
        getDay,
        getYesterday8,
        getDay8,
        getTomorrow8,
        getLastWeek,
        getAfterDay
    };
})();
