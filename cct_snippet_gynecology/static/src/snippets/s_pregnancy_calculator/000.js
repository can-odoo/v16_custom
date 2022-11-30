odoo.define('cct_snippet_gynecology.s_pregnancy_calculator', function(require) {
    'use strict';

    const publicWidget = require('web.public.widget');
    const Dialog = require('web.Dialog');
    // var datepicker = require('web.datepicker');
    
    const PregnancyCalculatorSnippet = publicWidget.Widget.extend({
        selector: '.s_pregnancy_calculator',
        events: {
            'click .calculate': '_onClickCalculate',
        },

        // /**
        //  * @override
        //  */
        // start: function (ev) {
        //     this._super.apply(this, arguments);
        //     this.$('.dateselector').datepicker({
        //         // showOn: "both",
        //         format: 'mm-dd-yyyy',
        //     });
        //     console.log("I am called");
        //     // this.$('.dateselector').datetimepicker();
        // },

        /**
         * Asks the datepicker widget to activate the input, instead of doing it
         * ourself, such that 'input' events triggered by the lib are correctly
         * intercepted, and don't produce unwanted 'field_changed' events.
         *
        // * @override
        // */
        // activate: function () {
        //     if (this.isFocusable() && this.datewidget) {
        //         this.datewidget.$input.focus();
        //         this.datewidget.$input.select();
        //         return true;
        //     }
        //     return false;
        // },

        _onClickCalculate: function(ev) {
            let dateStr = this.$(".dateselector").val();
            const isValidDate = (dateStr) => {
                let datePat = /^(\d{1,2})(\/|-)(\d{1,2})\2(\d{4})$/; // requires 4 digit year
                let matchArray = dateStr.match(datePat); // is the format ok?
                if (matchArray == null) {
                    Dialog.alert(this, "Date is not in a valid format.");
                    return false;
                }
                return true;
            }

            const resDate = (dateObj) => {
                let month = dateObj.getMonth()+1;
                month = (month < 10) ? "0" + month : month;
                let day   = dateObj.getDate();
                day = (day < 10) ? "0" + day : day;
                let year  = dateObj.getYear();
                if (year < 2000) year += 1900;
                return (month + "/" + day + "/" + year);
            }

            const calculatePregnancy = () => {
                // creates new date objects
                let menstrual = new Date();
                let ovulation = new Date();
                let dueDate = new Date();
                let today = new Date();

                // sets variables to invalid state ==> 0
                let cycle = 0;
                let luteal = 0;

                // Validates menstrual date
                if (isValidDate(dateStr)) {
                    let menstrualInput = new Date(dateStr);
                    menstrual.setTime(menstrualInput.getTime());
                }
                else return false;

                // Average Length of cycle (22 to 45), default 28
                cycle = 28;

                // validates cycle range, from 22 to 45
                if (cycle != "" && (cycle < 22 || cycle > 45)) {
                    Dialog.alert(this,
                        `Your cycle length is either too short or too long for
                         calculations to be very accurate!  We will still try to
                         complete the calculation with the figure you entered.`
                    );
                }

                // Average Luteal Phase length (9 to 16) default 14
                luteal = 14;

                // validates luteal range, from 9 to 16
                if (luteal != "" && (luteal < 9 || luteal > 16)) {
                    Dialog.alert(this,
                        `Your luteal phase length is either too short or too long for
                         calculations to be very accurate!  We will still try to complete
                         the calculation with the figure you entered.`
                    );
                }

                // sets ovulation date to menstrual date + cycle days - luteal days
                // the '*86400000' is necessary because date objects track time
                // in milliseconds;  86400000 milliseconds equals one day

                ovulation.setTime(menstrual.getTime() + (cycle*86400000) - (luteal*86400000));
                this.$(".con_date").text(resDate(ovulation));

                // sets due date to ovulation date plus 266 days
                dueDate.setTime(ovulation.getTime() + 266*86400000);
                $(".due_date").text(resDate(dueDate));


                // sets fetal age to 14 + 266 (pregnancy time) - time left
                let fetalAge = 14 + 266 - ((dueDate - today) / 86400000);

                // sets weeks to whole number of weeks
                let weeks = parseInt(fetalAge / 7);

                // sets days to the whole number remainder
                let days = Math.floor(fetalAge % 7);

                // fetal age message, automatically includes 's' on week and day if necessary
                fetalAge = weeks + " week" + (weeks > 1 ? "s" : "") + ", " + days + " days";
                this.$(".lop").text(fetalAge);
                return false;

            }
            calculatePregnancy();
        },
    });

    publicWidget.registry.PregnancyCalculatorSnippet = PregnancyCalculatorSnippet;
});
