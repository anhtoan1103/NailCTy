/* By Theme */
function web_goTo(jumpToElement, redirectURL) {
    scrollJumpto(jumpToElement, window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile', redirectURL);
}

/* Booking */
const maskLoadingHtml = '<div class="mask_booking" style="position: absolute; z-index: 2; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>';
let webBookingForm = {
    formID: 'form#formBooking',
    formConfirmID: 'form#formBookingConfirm',
    boxBookingInfo: '#boxBookingInfo',
    boxServiceStaff: '#boxServiceStaff',
    boxDateTime: '#boxDateTime',
    popupBookingConfirm: '#popupBookingConfirm',

    itemIndex: 0,
    categories: {},
    services: {},
    staffs: {},
    getHoursProcess: {
        'queue': '',
        'process': '',
        'sending': false,
    },
    saveFormProcess: {
        'queue': 0,
        'process': 0,
        'sending': false,
    },

    init: function (categories_JsonString, services_JsonString, staffs_JsonString, dataForm_JsonString) {
        let _this = this;

        // Events
        _this.setEvents();

        // Category & Service
        _this.setCategories(categories_JsonString);
        _this.setServices(services_JsonString);

        // Staffs
        _this.setStaffs(staffs_JsonString);

        // Data Form
        _this.setDataForm(dataForm_JsonString);
    },

    setEvents: function () {
        let _this = this;
        let formObj = $(_this.formID);
        let formConfirmObj = $(_this.formConfirmID);

        // Date time picker
        formObj.find('.booking_date').mask(webFormat.dateFormat.replace(/[^\d\/]/g, '0'), {placeholder: webFormat.dateFormat});
        formObj.find('.booking_date').datetimepicker({
            format: webFormat.dateFormat,
            minDate: webBooking.minDate,
            defaultDate: webBooking.minDate,
        });

        formObj.on('dp.change', '.booking_date', function () {
            _this.setOptionCategoryAndServices();
            _this.setOptionStaffs();

            _this.generalHTML(true);
            _this.saveForm();
        });

        formObj.on('change', '.booking_service', function () {
            let itemID = $(this).closest('.booking-item').attr('id');
            _this.setOptionStaff(itemID);

            _this.generalHTML(true);
            _this.saveForm();
        });

        formObj.on('change', '.booking_staff', function () {
            _this.generalHTML(true);
            _this.saveForm();
        });

        formObj.on('click', '.booking_item_add', function () {
            _this.addItem();
            _this.saveForm();
        });

        formObj.on('click', '.booking_item_remove', function () {
            let itemID = $(this).closest('.booking-item').attr('id');
            _this.removeItem(itemID);

            _this.generalHTML(true);
            _this.saveForm();
        });

        formObj.on('click', '.search_booking', function (e) {
            e.preventDefault();

            let _self = $(this);
            _self.attr('disabled', 'disabled');

            _this.generalHTML();
            _this.saveForm();

            _self.removeAttr('disabled');
        });

        $(`${_this.boxBookingInfo}, ${_this.formID}`).on('click', '.open_booking', function (e) {
            e.preventDefault();

            let _self = $(this);
            formObj.find('[name="booking_hours"]').val(_self.attr('valhours'));

            if (_this.validate()) {
                $.magnificPopup.open({
                    type: 'inline',
                    midClick: true,
                    closeOnBgClick: false,
                    items: {
                        src: _this.popupBookingConfirm,
                    },
                });
            }
        });

        formConfirmObj.on('click', '.btn_cancel', function (e) {
            e.preventDefault();
            $.magnificPopup.close();
        });

        formConfirmObj.validate({
            submit: {
                settings: {
                    clear: 'keypress',
                    display: "inline",
                    button: ".btn_confirm",
                    inputContainer: 'group-select',
                    errorListClass: 'form-tooltip-error',
                },
                callback: {
                    onSubmit: function (node, formData) {
                        formConfirmObj.find(".btn_confirm").attr("disabled", "disabled");

                        let isValidate = true;
                        formConfirmObj.removeError();

                        if (webGlobal.enableRecaptcha) {
                            let g_recaptcha_response = $("#g-recaptcha-response").val();
                            if (g_recaptcha_response) {
                                formObj.find('[name="g-recaptcha-response"]').val(g_recaptcha_response);
                            } else {
                                isValidate = false;
                                call_notify('Notification', 'Recaptcha is invalid', "error");
                            }
                        }

                        if (isValidate) {
                            formObj.find('[name="booking_name"]').val(formData['booking_name']);
                            formObj.find('[name="booking_phone"]').val(formData['booking_phone']);
                            formObj.find('[name="booking_email"]').val(formData['booking_email']);
                            formObj.find('[name="notelist"]').val(formData['notelist']);
                            formObj.find('[name="store_id"]').val(formData['choose_store']);

                            formObj.submit();
                            return true;
                        } else {
                            formConfirmObj.find(".btn_confirm").removeAttr("disabled");
                            return false;
                        }
                    },
                    onError: function (node, globalError) {
                        let error_msg = '';
                        for (let p in globalError) {
                            error_msg += globalError[p] + '<br>';
                        }
                        call_notify('Notification', error_msg, "error");
                    }
                }
            }
        });
    },

    setCategories: function (categories_JsonString) {
        let _this = this;

        _this.categories = JSON.parse(categories_JsonString);
    },

    setServices: function (services_JsonString) {
        let _this = this;

        _this.services = JSON.parse(services_JsonString);
    },

    setStaffs: function (staffs_JsonString) {
        let _this = this;

        _this.staffs = JSON.parse(staffs_JsonString);
    },

    setDataForm: function (dataForm_JsonString) {
        let _this = this;
        let formObj = $(_this.formID);

        let dataForm_Json = JSON.parse(dataForm_JsonString);

        // Date
        let date = dataForm_Json.booking_date ? dataForm_Json.booking_date : webBooking.minDate;
        formObj.find('.booking_date').val(date);

        // Services & staff
        let generalHtml = false;
        let serviceAndStaffs = dataForm_Json.service_staff ? dataForm_Json.service_staff : [","];
        let ItemCnt = 0;
        for (let x in serviceAndStaffs) {
            ItemCnt++;
            if (ItemCnt > 1) {
                _this.addItem();
            }


            let bookingItemObj = formObj.find('.booking-item').last();
            let bookingItemID = bookingItemObj.attr('id');
            let serviceAndStaff = serviceAndStaffs[x].split(',');

            let serviceID = serviceAndStaff[0];
            _this.setOptionCategoryAndService(bookingItemID, serviceID);

            let staffID = serviceAndStaff[1];
            _this.setOptionStaff(bookingItemID, staffID);

            if (serviceID) {
                generalHtml = true;
            }
        }

        if (generalHtml) {
            _this.generalHTML();
        }
    },

    setOptionCategoryAndServices: function () {
        let _this = this;
        let formObj = $(_this.formID);

        let bookingItemsObj = formObj.find('.booking-item');
        bookingItemsObj.each(function () {
            let bookingItemID = $(this).attr('id');
            _this.setOptionCategoryAndService(bookingItemID);
        });
    },

    setOptionCategoryAndService: function (itemID, serviceID) {
        let _this = this;
        let formObj = $(_this.formID);
        let dateObj = formObj.find('.booking_date');
        let bookingItemObj = formObj.find(`#${itemID}`);
        let serviceObj = bookingItemObj.find('.booking_service');

        let maskLoadingObj = $(maskLoadingHtml);
        serviceObj.parent().append(maskLoadingObj);

        let serviceIDSelected = serviceID ? serviceID : serviceObj.val();
        let dayName = _this.getDayOfWeek(dateObj.val(), true);

        let html = `<option value="">${webForm['booking_service_placeholder']}</option>`;
        for (let x in _this.categories) {
            let category = _this.categories[x];
            let services = _this.categories[x].services;

            let optionServiceHtml = '';
            for (let y in services) {
                let service = _this.getService(services[y], dayName);
                if (service) {
                    let selected = serviceIDSelected * 1 === service.id * 1 ? 'selected' : '';
                    optionServiceHtml += `<option ${selected} value="${service.id}">${service.name}` + (service.price ? ` (${service.price})` : '') + `</option>`;
                }
            }

            if (optionServiceHtml) {
                html += `<optgroup label="${category.name}">${optionServiceHtml}</optgroup>`;
            }
        }
        serviceObj.html(html);
        maskLoadingObj.remove();
    },

    getService: function (serviceID, dayName) {
        let _this = this;

        let service = null;
        if (_this.services && _this.services[serviceID]) {
            if (dayName && _this.services[serviceID].schedule === true) {
                for (let x in _this.services[serviceID].scheduleDay) {
                    if (_this.services[serviceID].scheduleDay[x] === dayName) {
                        service = _this.services[serviceID];
                        break;
                    }
                }
            } else {
                service = _this.services[serviceID];
            }
        }

        return service;
    },

    setOptionStaffs: function () {
        let _this = this;
        let formObj = $(_this.formID);

        let bookingItemsObj = formObj.find('.booking-item');
        bookingItemsObj.each(function () {
            let itemID = $(this).attr('id');
            _this.setOptionStaff(itemID);
        });
    },

    setOptionStaff: function (itemID, staffID) {
        let _this = this;
        let formObj = $(_this.formID);
        let dateObj = formObj.find('.booking_date');
        let bookingItemObj = formObj.find(`#${itemID}`);
        let serviceObj = bookingItemObj.find('.booking_service');
        let staffObj = bookingItemObj.find('.booking_staff');

        let maskLoadingObj = $(maskLoadingHtml);
        staffObj.parent().append(maskLoadingObj);

        let serviceID = serviceObj.val();
        let service = _this.getService(serviceID);
        let staffIDs = service ? service.staffs : null;
        let staffIDSelected = staffID ? staffID : staffObj.val();
        let dayName = _this.getDayOfWeek(dateObj.val(), true);

        let html = `<option value="">${webForm['booking_technician_placeholder']}</option>`;
        for (let x in staffIDs) {
            let staff = _this.getStaff(staffIDs[x], dayName);
            if (staff) {
                let selected = staffIDSelected * 1 === staff.id * 1 ? 'selected' : '';
                html += `<option ${selected} value="${staff.id}">${staff.name}` + (staff.note ? ` (${staff.note})` : '') + `</option>`;
            }
        }
        staffObj.html(html);
        maskLoadingObj.remove();
    },

    getStaff: function (staffID, dayName) {
        let _this = this;

        let staff = null;
        if (_this.staffs && _this.staffs[staffID]) {
            if (dayName && _this.staffs[staffID].schedule === true) {
                for (let x in _this.staffs[staffID].scheduleDay) {
                    if (_this.staffs[staffID].scheduleDay[x] === dayName) {
                        staff = _this.staffs[staffID];
                        break;
                    }
                }
            } else {
                staff = _this.staffs[staffID];
            }
        }

        return staff;
    },

    addItem: function () {
        let _this = this;
        let formObj = $(_this.formID);
        let bookingItemObj = formObj.find('.booking-item').last();

        _this.itemIndex++;
        let html = `
            <div class="row booking-service-staff booking-item is-more" id="bookingItem_${_this.itemIndex}">
                <div class="remove-services pointer booking_item_remove"><i class="fa fa-minus-circle"></i></div>
                ` + bookingItemObj.html() + `
            </div>
        `;
        let htmlObj = $(html);
        htmlObj.find('.booking_service').val('');
        htmlObj.find('.booking_staff').val('');

        bookingItemObj.after(htmlObj);
    },

    removeItem: function (itemID) {
        let _this = this;
        let formObj = $(_this.formID);
        let bookingItemObj = formObj.find(`#${itemID}`);

        bookingItemObj.remove();
    },

    validate: function () {
        let _this = this;

        let formObj = $(_this.formID);
        let dateObj = formObj.find('.booking_date');
        let servicesObj = formObj.find('.booking_service');
        let staffsObj = formObj.find('.booking_staff');

        let isValidate = true;
        clearAllValidateMsg(formObj);

        // Date
        if (!dateObj.val()) {
            isValidate = false;
            showValidateMsg(dateObj, webForm ['booking_date_err']);
        }

        // Services
        servicesObj.each(function () {
            let _self = $(this);
            if (!_self.val()) {
                isValidate = false;
                showValidateMsg(_self, webForm ['booking_service_err']);
            }
        });

        // Staffs
        if (webBooking.requiredTechnician) {
            staffsObj.each(function () {
                let _self = $(this);
                if (!_self.val()) {
                    isValidate = false;
                    showValidateMsg(_self, webForm ['booking_technician_err']);
                }
            });
        }

        if (isValidate) {
            return true;
        } else {
            let errorElement = formObj.find('.error').first();
            web_goTo(errorElement.length ? errorElement : formObj);
            return false;
        }
    },

    generalHTML: function (validate) {
        let _this = this;

        if (!webBooking.requiredHour) {
            return false;
        }

        if (validate || _this.validate()) {
            $(_this.boxBookingInfo).show();
            _this.generalHTMLServiceStaff();
            _this.generalHTMLDateTime();
        }
    },

    generalHTMLServiceStaff: function () {
        let _this = this;

        if (!webBooking.requiredHour) {
            return false;
        }

        let formObj = $(_this.formID);
        let servicesObj = formObj.find('.booking_service');
        let staffsObj = formObj.find('.booking_staff');

        let maskLoadingObj = $(maskLoadingHtml);
        $(_this.boxBookingInfo).append(maskLoadingObj);

        let services = [];
        servicesObj.each(function () {
            let _self = $(this).find('option:selected');

            let service = {
                name: 'N/A',
                price: 'N/A',
            };

            let serviceItem = _this.getService(_self.val());
            if (serviceItem) {
                service.name = serviceItem.name;
                service.price = serviceItem.price;
            }

            services.push(service);
        });

        let staffs = [];
        staffsObj.each(function () {
            let _self = $(this).find('option:selected');

            let staff = {
                name: webForm['any_person'],
                image: webGlobal.noPhoto,
                imageIsNo: true,
            };

            let staffItem = _this.getStaff(_self.val());
            if (staffItem) {
                staff.name = staffItem.name;
                staff.image = staffItem.image;
                staff.imageIsNo = staffItem.imageIsNo;
            }

            staffs.push(staff);
        });

        let html = '';
        for (let x in services) {
            html += `
            <div class="service-staff">
                <div class="service-staff-avatar ` + (staffs[x].imageIsNo ? 'no-photo' : '') + `">
                    <img class="img-responsive" src="${staffs[x].image}" alt="${staffs[x].name}">
                </div>
                <div class="service-staff-info">
                    <h5>${staffs[x].name}</h5>
                    <p>${services[x].name}</p>
                    <p>${webForm['price']}: ${services[x].price}</p>
                </div>
            </div>
            `;
        }
        $(_this.boxServiceStaff).html(html);

        maskLoadingObj.remove();
    },

    generalHTMLDateTime: function () {
        let _this = this;

        if (!webBooking.requiredHour) {
            return false;
        }

        _this.getHoursProcess.queue++;
        if (_this.getHoursProcess.sending === false) {
            _this.getHoursProcess.process = _this.getHoursProcess.queue;

            let formObj = $(_this.formID);
            let dateObj = formObj.find('.booking_date');
            let servicesObj = formObj.find('.booking_service');
            let staffsObj = formObj.find('.booking_staff');

            let maskLoadingObj = $(maskLoadingHtml);
            $(_this.boxBookingInfo).append(maskLoadingObj);

            let date = dateObj.val();
            if (date) {
                let serviceIDs = [];
                servicesObj.each(function () {
                    let _self = $(this).find('option:selected');
                    serviceIDs.push(_self.val() * 1);
                });

                let staffIDs = [];
                staffsObj.each(function () {
                    let _self = $(this).find('option:selected');
                    staffIDs.push(_self.val() * 1);
                });

                $.ajax({
                    type: "post",
                    url: "/book/get_hours",
                    data: {input_date: date, input_services: serviceIDs, input_staffs: staffIDs},
                    beforeSend: function () {
                        _this.getHoursProcess.sending = true;
                    },
                    success: function (response) {
                        let responseObj = JSON.parse(response);
                        let boxDateTimeObj = $(_this.boxDateTime);

                        boxDateTimeObj.find('#dateInfo').html(_this.convertDate(responseObj.date));

                        boxDateTimeObj.find('#timeAMHtml').html(responseObj.htmlMorning);
                        boxDateTimeObj.find('#timeAMNote').html(responseObj.checkmorning ? '' : webForm['booking_hours_expired']);

                        boxDateTimeObj.find('#timePMHtml').html(responseObj.htmlAfternoon);
                        boxDateTimeObj.find('#timePMNote').html(responseObj.checkafternoon ? '' : webForm['booking_hours_expired']);
                    },
                    complete: function () {
                        _this.getHoursProcess.sending = false;
                        if (_this.getHoursProcess.queue !== _this.getHoursProcess.process) {
                            _this.generalHTMLDateTime();
                        }

                        maskLoadingObj.remove();
                    }
                });
            } else {
                $(_this.boxDateTime).find('#dateInfo').html('N/A');
                maskLoadingObj.remove();
            }
        }
    },

    saveForm: function () {
        let _this = this;

        _this.saveFormProcess.queue++;
        if (_this.saveFormProcess.sending === false) {
            _this.saveFormProcess.process = _this.saveFormProcess.queue;
            $.ajax({
                type: "post",
                url: "/book/saveform",
                data: $(_this.formID).serialize(),
                beforeSend: function () {
                    _this.saveFormProcess.sending = true;
                },
                complete: function () {
                    _this.saveFormProcess.sending = false;
                    if (_this.saveFormProcess.queue !== _this.saveFormProcess.process) {
                        _this.saveForm();
                    }
                }
            });
        }
    },

    convertDate: function (input) {
        let listDate = input.split('/');
        let splitDate = webFormat.datePosition.split(',');
        let newDate = listDate[splitDate[2]] + '/' + listDate[splitDate[1]] + '/' + listDate[splitDate[0]];
        newDate += '';

        let date = new Date(newDate);
        let months = [webForm['jan'], webForm['feb'], webForm['mar'], webForm['apr'], webForm['may'], webForm['jun'], webForm['jul'], webForm['aug'], webForm['sep'], webForm['oct'], webForm['nov'], webForm['dec']];
        let days = [webForm['sunday'], webForm['monday'], webForm['tuesday'], webForm['wednesday'], webForm['thursday'], webForm['friday'], webForm['saturday']];

        return days[date.getDay()] + ", " + months[date.getMonth()] + "-" + date.getDate() + "-" + date.getFullYear();
    },

    getDayOfWeek: function (input, type) {
        // ISO-8601
        let dayOfWeek_Obj = {
            1: "monday",
            2: "tuesday",
            3: "wednesday",
            4: "thursday",
            5: "friday",
            6: "saturday",
            7: "sunday"
        };

        let dayNumber = moment(input).day();
        dayNumber *= 1;
        if (dayNumber === 0) {
            dayNumber = 7;
        }

        return type ? dayOfWeek_Obj[dayNumber] : dayNumber;
    },
};

(function ($) {
    /* REMOVE VALIDATE MSG */
    $('body').on('select2:close, change, focus', 'select, input', function (e) {
        clearValidateMsg($(this));
    });
})(jQuery);

function initImageMagnificPopup(elementClass) {
    let groups = {};
    $(elementClass).each(function () {
        let id = $(this).attr('data-group');
        if (!groups[id]) {
            groups[id] = [];
        }
        groups[id].push(this);
    });
    $.each(groups, function () {
        $(this).magnificPopup({
            type: 'image',
            closeOnContentClick: true,
            closeBtnInside: true,
            gallery: {enabled: true}
        });
    });
}

function showValidateMsg( objThis, msg ) {
    if( !msg ){
        msg = objThis.attr('data-validation-message');
    }
    objThis.addClass('error');
    objThis.parent().append(`<div class="form-tooltip-error"><ul><li>${msg}</li></ul></div>`);
}
function clearValidateMsg( objThis) {
    objThis.removeClass("error");
    objThis.parent().find('.form-tooltip-error').remove();
}
function clearAllValidateMsg(objForm) {
    objForm.find('.error').removeClass('error');
    objForm.find('.form-tooltip-error').remove();
}

const stackBottomRightModal = {
    dir1: "up",
    dir2: "left",
    firstpos1: 25,
    firstpos2: 25,
    push: "bottom",
};
var call_notify_object = {};
function callNotify(title_msg, msg, type_notify, delay, remove, type ) {
    type_notify = type_notify ? type_notify : "error";
    delay = delay ? +delay : 3000;
    remove = (typeof remove == 'undefined' || remove) ?  true : false;

    let icon = "";
    if(type_notify == "error" || type_notify == "notice") {
        icon = "fa fa-exclamation-circle";
    } else if(type_notify == "success") {
        icon = "fa fa-check-circle";
    }

    if( remove && typeof call_notify_object.remove === 'function' )
    {
        call_notify_object.remove();
    }

    let option = {
        title: title_msg,
        text: msg,
        type: type_notify,
        icon: icon,

        closer: true,
        closerHover: true,
        sticker: false,
        stickerHover: false,
        labels: {close: 'Close', stick: 'Stick', unstick: 'Unstick'},
        classes: {closer: 'closer', pinUp: 'pinUp', pinDown: 'pinDown'},

        remove: true,
        destroy: true,
        mouseReset: true,
        delay: delay,
    }

    if( !type ){
        option.addclass = 'alert-with-icon stack-bottomright';
        option.stack = stackBottomRightModal;
    } else {
        option.addclass = 'alert-with-icon';
    }

    call_notify_object = new PNotify(option);

    return call_notify_object;
}

function call_notify(title_msg, msg, type_notify) {
    callNotify(title_msg, msg, type_notify, 0, 1, 1 );
}

function change_content(elemenThis, elemenTo) {
    $(elemenTo).html($(elemenThis).val());
}

function check_enter_number(evt, onthis) {
    if (isNaN(onthis.value + "" + String.fromCharCode(evt.charCode))) {
        return false;
    }
}

function change_product(pid, quantity) {
    $.ajax({
        type: "post",
        url: "/cart/change_product",
        data: {pid:pid, quantity: quantity},
        dataType:'Json',
        success: function(obj) {
            obj.pid = pid;
            change_cart_info(obj);
        },
        error: function () {
            call_notify('Notification', 'Error when process request', "error");
        }
    });
}

function update_price(onThis) {
    let _this = $(onThis);
    let id = parseInt(_this.attr("pid")); id = isNaN(id) ? 0 : id;
    let cus_price = parseFloat(_this.val()); cus_price = isNaN(cus_price) ? 0 : cus_price;
    let min_val = parseFloat(_this.attr("min")); min_val = isNaN(min_val) ? 0 : min_val;
    let max_val = parseFloat(_this.attr("max")); max_val = isNaN(max_val) ? 0 : max_val;

    /*Update price*/
    if ( cus_price >= min_val && cus_price <= max_val ) {
        _this.css("border-color", "");
        $('.btn_payment').prop('disabled', false).removeClass('disabled');

        /*Change money*/
        $(".camount").html(cus_price > 0 ? `\$${cus_price}` : 'N/A');

        //Ajax
        $.ajax({
            type: "post",
            url: "/cart/updateprice",
            data: {cus_price: cus_price, id: id},
            success: function (html) {
                let obj = JSON.parse(html);

                if (obj.status == "error") {
                    _this.val(obj.price);
                    call_notify('Notification', obj.msg, "error");
                    return false;
                }

                if (obj.cart_data) {
                    let data = {
                        "subtotal": obj.cart_data[2],
                        "discount": obj.cart_data[5],
                        "tax": obj.cart_data[1],
                        "amount": obj.cart_data[3],
                        "pid": id,
                    };
                    change_cart_info(data);
                }
            },
            error: function () {
                call_notify('Notification', 'Error when process request', "error");
            }
        });
    } else {
        _this.css("border-color", "red");
        $('.btn_payment').prop('disabled', true).addClass('disabled');
    }
}

function update_quantity(onThis) {
    let _this = $(onThis);
    let id = parseInt(_this.attr("pid")); id = isNaN(id) ? 0 : id;
    let cus_quantity = parseFloat(_this.val()); cus_quantity = isNaN(cus_quantity) ? 1 : cus_quantity;

    /*Update quantity*/
    if ( cus_quantity > 0 ) {
        _this.css("border-color", "");
        $('.btn_payment').prop('disabled', false).removeClass('disabled');

        /*Change quantity*/
        $('#cart_quantity').text(cus_quantity);
        $(".cquantity").html(cus_quantity);

        //Ajax
        $.ajax({
            type: "post",
            url: "/cart/update",
            data: {quantity: cus_quantity, id: id},
            success: function (html) {
                let obj = JSON.parse(html);

                if ( obj.status == "error" ) {
                    _this.val(obj.price);
                    call_notify('Notification', obj.msg, "error");
                    return false;
                }

                if (obj.cart_data) {
                    let data = {
                        "subtotal": obj.cart_data[2],
                        "discount": obj.cart_data[5],
                        "tax": obj.cart_data[1],
                        "amount": obj.cart_data[3],
                        "pid": id,
                    };
                    change_cart_info(data);
                }
            },
            error: function () {
                call_notify('Notification', 'Error when process request', "error");
            }
        });
    } else {
        _this.css("border-color", "red");
        $('.btn_payment').prop('disabled', true).addClass('disabled');
    }
}

function change_cart_info( data ) {
    $("#cart_subtotal").html(data.subtotal);
    $("#cart_product_discount_value, #cart_discount_code_value").html(data.discount);
    $("#cart_tax").html(data.tax);
    $("#cart_payment_total").html(data.amount);
    if ( data.pid ) {
        $("#custom_price").attr("pid", data.pid);
    }
}

function update_cart(onthis) {
    let _this = $(onthis);
    let id = parseInt(_this.attr("pid")); id = isNaN(id) ? 0 : id;
    let cus_quantity = parseFloat(_this.val()); cus_quantity = isNaN(cus_quantity) ? 1 : cus_quantity;

    /*Update quantity*/
    if ( cus_quantity > 0 ) {
        _this.css("border-color", "");
        $('.btn_cart_order').prop('disabled', false).removeClass('disabled');

        //Ajax
        $.ajax({
            type: "post",
            url: "/cart/update",
            data: {quantity: cus_quantity, id: id},
            success: function (html) {
                let obj = JSON.parse(html);

                if ( obj.status == "error" ) {
                    _this.val(obj.price);
                    call_notify('Notification', obj.msg, "error");
                    return false;
                }

                /*Change money*/
                if ( obj.total_show ) {
                    $(`#total_change_${id}`).html(obj.total_show);
                }

                if (obj.cart_data) {
                    let data = {
                        "subtotal": obj.cart_data[2],
                        "discount": obj.cart_data[5],
                        "tax": obj.cart_data[1],
                        "amount": obj.cart_data[3],
                        "pid": id,
                    };
                    change_cart_info(data);
                }
            },
            error: function () {
                call_notify('Notification', 'Error when process request', "error");
            }
        });
    } else {
        _this.css("border-color", "red");
        $('.btn_cart_order').prop('disabled', true).addClass('disabled');
    }
}

function update_price_cart(onThis) {
    let _this = $(onThis);
    let id = parseInt(_this.attr("pid")); id = isNaN(id) ? 0 : id;
    let cus_price = parseFloat(_this.val()); cus_price = isNaN(cus_price) ? 0 : cus_price;
    let min_val = parseFloat(_this.attr("min")); min_val = isNaN(min_val) ? 0 : min_val;
    let max_val = parseFloat(_this.attr("max")); max_val = isNaN(max_val) ? 0 : max_val;

    /*Update price*/
    if ( cus_price >= min_val && cus_price <= max_val ) {
        _this.css("border-color", "");
        $('.btn_cart_order').prop('disabled', false).removeClass('disabled');

        //Ajax
        $.ajax({
            type: "post",
            url: "/cart/updateprice",
            data: {cus_price: cus_price, id: id},
            success: function (html) {
                let obj = JSON.parse(html);

                if ( obj.status == "error" ) {
                    _this.val(obj.price);
                    call_notify('Notification', obj.msg, "error");
                    return false;
                }

                /*Change money*/
                if ( obj.total_show ) {
                    $(`#total_change_${id}`).html(obj.total_show);
                }

                if (obj.cart_data) {
                    let data = {
                        "subtotal": obj.cart_data[2],
                        "discount": obj.cart_data[5],
                        "tax": obj.cart_data[1],
                        "amount": obj.cart_data[3],
                        "pid": id,
                    };
                    change_cart_info(data);
                }
            },
            error: function () {
                call_notify('Notification', 'Error when process request', "error");
            }
        });
    } else {
        _this.css("border-color", "red");
        $('.btn_cart_order').prop('disabled', true).addClass('disabled');
    }
}

function delete_cart(onThis) {
    let _this = $(onThis);
    let id = parseInt(_this.attr("pid")); id = isNaN(id) ? 0 : id;

    //Ajax
    $.ajax({
        type: "post",
        url: "/cart/delitem",
        data: {id: id},
        success: function (html) {
            let obj = JSON.parse(html);

            /*Delete item*/
            $(`#cart_item_${id}`).remove();

            /*Change order*/
            let cart_items = $(".cart_item");
            if ( cart_items.length <= 0 ) {
                $("#cart_items").html('<tr><td colspan="5"><div class="price-row-col"><b>Cart empty...</b></div></td></tr>');
            }

            if ( obj.cart_data ) {
                let data = {
                    "subtotal": obj.cart_data[2],
                    "discount": obj.cart_data[5],
                    "tax": obj.cart_data[1],
                    "amount": obj.cart_data[3],
                };
                change_cart_info(data);
            }
        }
    });
}

(function ($) {
    'use strict';

    /*GIFTCARDS PAYMENT*/
    let formPaymentGiftcards = $("form#paymentGiftcards");
    formPaymentGiftcards.validate({
        submit: {
            settings: {
                clear: 'keypress',
                display: "inline",
                button: ".btn_payment",
                inputContainer: 'form-group',
                errorListClass: 'form-tooltip-error',
            },
            callback: {
                onSubmit: function (node, formdata) {
                    let isValidate = true;

                    /*Deny duplicate click*/
                    formPaymentGiftcards.find(".btn_payment").attr("disabled", "disabled");

                    /*Clears all form errors*/
                    formPaymentGiftcards.removeError();

                    /*Check price*/
                    let custom_price = parseFloat(formdata['custom_price']); custom_price = isNaN(custom_price) ? 0 : custom_price;
                    let custom_price_obj = formPaymentGiftcards.find('[name="custom_price"]');
                    let min_val = parseFloat(custom_price_obj.attr("min")); min_val = isNaN(min_val) ? 0 : min_val;
                    let max_val = parseFloat(custom_price_obj.attr("max")); max_val = isNaN(max_val) ? 0 : max_val;

                    if( custom_price < min_val || custom_price > max_val ) {
                        isValidate = false;

                        let notify = `Accept Amount From ${min_val} to ${max_val}`;
                        formPaymentGiftcards.addError({
                            'custom_price': notify,
                        });
                    }

                    if( isValidate ){
                        waitingDialog.show("Please wait a moment ...");
                        node[0].submit();
                    } else {
                        formPaymentGiftcards.find(".btn_payment").removeAttr("disabled");
                        scrollJumpto(formPaymentGiftcards);
                    }

                    return false;
                },
                onError: function () {
                    scrollJumpto(formPaymentGiftcards);
                }
            }
        }
    });

    /*FORM PAYMENT*/
    let formPayment = $("form#payment");
    formPayment.validate({
        submit: {
            settings: {
                clear: 'keypress',
                display: "inline",
                button: "[type='submit']",
                inputContainer: 'form-group',
                errorListClass: 'form-tooltip-error',
            },
            callback: {onSubmit: function (node) {
                    /*Deny duplicate click*/
                    formPayment.find(".btn_payment").attr("disabled", "disabled");

                    waitingDialog.show("Please wait a moment ...");
                    node[0].submit();

                    return false;
                },
                onError: function () {
                    scrollJumpto(formPayment);
                }
            }
        }
    });

    $("body").on("click", ".box_img_giftcard", function (e) {
        e.preventDefault();

        let _this = $(this);

        $(".box_img_giftcard").removeClass("active");
        _this.addClass("active");

        let src_img = _this.find("img").first().attr("src");
        let pid = _this.attr("pid"); pid = isNaN(pid) ? 0 : pid;
        let name = _this.attr("name");
        let price = parseFloat(_this.attr("price")); price = isNaN(price) ? 0 : price;
        let price_custom_enable = parseInt(_this.attr("price_custom_enable")); price_custom_enable = isNaN(price_custom_enable) ? 0 : price_custom_enable;
        let price_max_value = parseFloat(_this.attr("price_max_value")); price_max_value = isNaN(price_max_value) ? 0 : price_max_value;
        let quantity = 1;

        /*Payer*/
        formPaymentGiftcards.removeError();
        formPaymentGiftcards.find('input').css("border-color", "");

        /*Price*/
        let custom_price_obj = formPaymentGiftcards.find('[name="custom_price"]');
        custom_price_obj.val(price);
        custom_price_obj.attr('pid', pid);
        custom_price_obj.attr('min', price);
        custom_price_obj.attr('max', price_max_value);
        custom_price_obj.prop('readonly', price_custom_enable == 1 ? false : true);

        let custom_price_note_obj = formPaymentGiftcards.find('#custom_price_note');
        if ( price_custom_enable == 1 ) {
            custom_price_note_obj.find('.custom_price_note').text(`From \$${price} to \$${price_max_value}`);
            custom_price_note_obj.show();
        } else {
            custom_price_note_obj.hide();
        }

        /*Quantity*/
        let custom_quantity_obj = formPaymentGiftcards.find('[name="custom_quantity"]');
        custom_quantity_obj.val(quantity).attr('pid', pid);

        /*Cart*/
        $('#cart_image img').attr("src", src_img);
        $('#cart_quantity').text(quantity);
        $('#cart_name').text(name);

        /*Preview*/
        $(".preview_img img").attr("src", src_img);
        $('.camount').html(`\$${price}`);
        $(".cquantity").html(`${quantity}`);

        change_product(pid, quantity);
    });

    $("body").on("click", "input[name='send_to_friend']", function (e) {
        let _this = $(this);
        if ( _this.val() == 0 ) {
            _this.val(1).prop('checked', true);
            $(".box_recipient").show();
        } else {
            _this.val(0).prop('checked', false);
            $(".box_recipient").hide();
        }
    });
})(jQuery);

$(document).ready(function(){
    /*MAGIC POPUP*/
    initImageMagnificPopup('.m-magnific-popup');
    initImageMagnificPopup('.image-magnific-popup');

});

/********OLD*********/
(function ($) {
    'use strict';

    // /**
    // * Set date: Init date time picker for booking
    // * Note: place here for deny error when load booking email form in first
    // */
    // Date.prototype.addHours = function(h) {
    //     this.setTime(this.getTime() + (h*60*60*1000));
    //     return this;
    // }
    // var today = new Date(currDateT);
    // var future = new Date(currDateT);
    //
    // if(beforeTime == undefined || beforeTime == '' || beforeTime<0){
    //     beforeTime = 0;
    // }
    // var fourHoursLater =new Date().addHours(beforeTime);
    //
    // var set_date = parseInt(beforeDay) > 0 ? new Date(future.setDate(today.getDate()+beforeDay)) :  fourHoursLater;
    //     set_date = moment(set_date).format(dateFormatBooking);
    //     set_date = moment(set_date, dateFormatBooking).toDate();

    $('#datetimepicker_v1, .booking_date').datetimepicker({
        format: dateFormatBooking,
        minDate: minDateBooking,
    });
    // End set date

    /*-------------------------------------------
     02. wow js active
     --------------------------------------------- */
    new WOW().init();

    $(document).ready(function(){
        $("body").on("click",".btn-call", function(){
            $(this).prop("disabled", true);
            var obj = $(this);
            $.ajax({
                type: "post",
                url: "/home/count_click",
                success: function(response)
                {
                    // console.log(response);
                    $(obj).prop("disabled", false);
                }
            })
        });
    });



    /*-------------------------------------------
     03. Sticky Header
     --------------------------------------------- */
    $(window).on('scroll', function () {
        var scroll = $(window).scrollTop();
        if (scroll < 245) {
            $("#sticky-header-with-topbar").removeClass("scroll-header");
        } else {
            $("#sticky-header-with-topbar").addClass("scroll-header");
        }
    });




    /*--------------------------------
     /*-------------------------------------------
     05. Portfolio  Masonry (width)
     --------------------------------------------- */
    $(window).load(function () {
       
        $('.list-gallery').magnificPopup({
            delegate: 'a.fancybox',
            type: 'image',
            closeOnContentClick: true,
            closeBtnInside: true,
            gallery: {enabled: true}
        });

        // START SLIDER HOME
        if ( $('.tp-banner li').length > 0 ) {


            // set Height slide
            setEqualSlideHeight('.tp-banner-img');

            // When resize then reload social
            $(window).on('resize', function(){
                // Firing resize event only when resizing is finished
                clearTimeout(window.resizedFinishedSlider);
                window.resizedFinishedSlider = setTimeout(function(){
                    $('.tp-rightarrow').trigger('click');
                }, 250);
            });
        }
        // END SLIDER HOME
        
        $(".video-play, .bt-menu-trigger, .overlay-btn").click(function () {
            $(".overlay").addClass("show-overlay");
            var getSrc = $(".overlay").attr('src');
            $(".overlay").find(".show-iframe").html('<iframe src="" frameborder="0" allowfullscreen></iframe>');
            $(".show-iframe iframe").attr("src", getSrc);
        });
        $(".bt-menu-trigger, .overlay-btn").click(function () {
            $(".overlay").removeClass("show-overlay");
            $(".show-iframe iframe").attr("src", "");
        });
        
        $('.arrow-footer').click(function () {
            $('html, body').animate({scrollTop: 0}, 800);
            return false;
        });
        $('.item-gallery').each(function () {
            $(this).hover(function () {
                $(this).toggleClass("active");
            });
        });

        $('.main-content').on("mouseover",".item-gallery",function () {
            $(".item-gallery").removeClass("active");
                $(this).addClass("active");
            });


        
        // /* ======= shuffle js ======= */
        // if ($('#portfolio-grid').length > 0) {
        //     /* initialize shuffle plugin */
        //     var $grid = $('#portfolio-grid');

        //     $grid.shuffle({
        //         itemSelector: '.portfolio-item' // the selector for the items in the grid
        //     });

        //     /* reshuffle when user clicks a filter item */
        //     $('#filter li').on('click', function (e) {
        //         e.preventDefault();

        //         // set active class
        //         $('#filter li').removeClass('active');
        //         $(this).addClass('active');

        //         // get group name from clicked item
        //         var groupName = $(this).attr('data-group');

        //         // reshuffle grid
        //         $grid.shuffle('shuffle', groupName);
        //     });
        // }

    });
    /*-------------------------------------------
     06. UI Tab
     --------------------------------------------- */
    $("#tabs li").removeClass("ui-corner-top").addClass("ui-corner-left");
    $('[data-toggle="tooltip"]').tooltip();

    /*-------------------------------------------
     07. button add services
     --------------------------------------------- */
    $(document).ready(function () {
        // The maximum number of options
        var MAX_OPTIONS = 5;

       $.fn.is_on_screen = function(){
        var win = $(window);
        var viewport = {
            top : win.scrollTop(),
            left : win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = this.offset();
        if ( typeof bounds == 'undefined' )
        {
            return false;
        }
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();
        //
        if ( viewport.top >=  bounds.top) {
            var t =true;
           $('.btn_service_book').addClass('scroll_btn');
           $('.btn_service_book').css('right',viewport.right-bounds.right);
        }else{
            var t= false;
            
        }
        return t;
    };
       $(window).scroll(function(){ 
           if($('.btn_service_defale').is_on_screen()){
              
           }else{
               $('.btn_service_book').removeClass('scroll_btn');
               $('.btn_service_book').removeAttr('style');
           }
             
    
     });

        
    });

    /*-------------------------------------------
     8. Modal login form
     --------------------------------------------- */
    $(".databooktime").on("click", ".popup_login", function () {
        $.magnificPopup.open({
            type: 'inline',
            midClick: true,
            items: {
                src: '#popup_login'
            },
        });
        return false;
    })


    $("#send_booking").validate({
        submit: {
            settings: {
                button: ".btn_booking",
                inputContainer: '.input-box',
                errorListClass: 'form-tooltip-error',

            }
        }
    });

    $("#send_contact").validate({
        submit: {
            settings: {
                button: ".btn_contact",
                inputContainer: '.form-group',
                errorListClass: 'form-tooltip-error',

            }
        }
    });
        

    // SERVICE PAGE
    $("ul.listcatser li").mouseover(function () {
        $("ul.listcatser li.ui-state-default.ui-corner-left").removeClass("ui-state-active");
        $("ul.listcatser li.ui-tabs-active").addClass("ui-state-active");
        $(this).addClass("ui-state-active");
    });

    $("ul.listcatser li").mouseout(function () {
        $("ul.listcatser li.ui-state-default.ui-corner-left").removeClass("ui-state-active");
        $("ul.listcatser li.ui-tabs-active").addClass("ui-state-active");
    });

    // Auto select
    $("select.auto_select").each(function () {
        var val_default = $(this).attr("defaultvalue");
        $(this).find("option[value='" + val_default + "']").prop("selected", true);
    });

    var lid = $('input[name="lid"]').val();
        lid = $('ul.listcatser li[lid="'+lid+'"] a');
        if ( lid.length == 0 )
        {
            lid = $("ul.listcatser li:first a");
        }
        lid.trigger("click");
    // END SERVICE PAGE

    // BOOKING PAGE
    $(document).on("change", "#surveyForm .list_service", function () {
        var service_id = $(this).val();
        var list_staff = $(this).find("option:selected").attr("staff");
        
        if (service_id)
        {

            $(this).parent().find('.form-tooltip-error').remove();
        } else
        {

            $(this).parent().append('<div class="form-tooltip-error" data-error-list=""><ul><li>' + $(this).data('validation-message') + '</li></ul></div>');
        }
        var obj = JSON.parse(list_staff);
        var option = '<option value="">Service Provider</option>';
        for (var x in obj)
        {
            option += `<option value="` + obj[x].id + `" urlimg="` + obj[x].image + `">` + obj[x].name + `</option>`;
        }

        $(this).parents(".item-booking").find(".list_staff").html(option);

        // Save form
        saveForm();

    });
    // END BOOKING PAGE

    // BTN SEARCH BOOKING
    $(document).on('click',".btn_action",function () {
        var num = $(".list_service").length;
        var info_staff = [];
        var info_staff2 = [];
        var temp = {};
        var i = 0;
        var check = true;
        $(".list_service").each(function () {
            var checkval = $(this).val();
            if (checkval)
            {
                $(this).css("border-color", "#ccc");
                $(this).parent().find('.form-tooltip-error').remove();
            } else
            {
                check = false;
                $(this).css("border-color", "red");
                $(this).parent().append('<div class="form-tooltip-error" data-error-list=""><ul><li>' + $(this).data('validation-message') + '</li></ul></div>');
            }
            temp.price = $('option:selected', this).attr('price');
            temp.service = $('option:selected', this).text();
            info_staff.push(temp);
            temp = {};
            i++;
        });

        var j = 0;
        $(".list_staff").each(function () {
            var checkval = $(this).val();
            temp.image = $('option:selected', this).attr('urlimg');
            temp.name = checkval ? $('option:selected', this).text() : "Any person";
            info_staff2.push(temp);
            temp = {};
            j++;
        });

        if (check == true)
        {
            $(".box_detail_info").show();
            $("#box_person").html("Loading ...");
            var html_person = "";
            var j = 0;
            for (var x in info_staff)
            {
                var image = typeof (info_staff2[x].image) === "undefined" ? "/public/library/global/no-photo.jpg" : info_staff2[x].image;
                html_person += '<div class="col-lg-4 col-md-4 col-sm-6 col-xs-12 info-staff">'
                +'<div class="row">'
                    +'<div class="col-lg-4 col-md-4 col-sm-4 col-xs-4 img-info-staff">'
                    +'<a href="javascript:;">'
                    +'<img src="' + image + '" alt="' + info_staff2[x].name + '">'
                        +'</a>'
                    +'</div>'
                    +'<div class="col-lg-8 col-md-8 col-sm-8 col-xs-8 title-staff">'
                       +'<h2>' + info_staff2[x].name + '</h2>'
                        +'<p>' + info_staff[x].service + '</p>'
                        +'<p>Price: ' + info_staff[x].price + '</p>'
                    +'</div>'
                +'</div>'
                +'</div>';
            }

            $("#box_person").html(html_person);

            var typehtml = $("#surveyForm .choose_date").attr("typehtml");
            var date_choose = $("#surveyForm .choose_date").val();
            pushHtmlTime(date_choose, typehtml);


            var scroll = $("#box_person").offset().top;
            $('body').animate({scrollTop: scroll}, 600, 'swing');//.scrollTop( $("#book-info").offset().top );
            $('.time-booking.databooktime').show();
        } else
        {
            return false;
        }

    });
    // END BTN SEARCH BOOKING

    // CHOOSE DATE
    $("#surveyForm").on("dp.change", ".choose_date", function () {

        var typehtml = $(this).attr("typehtml");
        var date_choose = $(this).val();
        // set Html date
        setHtmldate(date_choose);
        // Save form
        saveForm();

        // change time by date choose
        pushHtmlTime(date_choose, typehtml);
        //data time
        // setTimeout(function(){ pushHtmlTime(date_choose, typehtml); }, 100);
    });
    // $(".choose_date").trigger("dp.change");

    // CHOOSE DATE
    $("#send_booking").on("dp.change", ".choose_date", function () {

        var typehtml = $(this).attr("typehtml");
        var date_choose = $(this).val();
        // change time by date choose
        pushHtmlTime(date_choose, typehtml);
        //data time
        // setTimeout(function(){ pushHtmlTime(date_choose, typehtml); }, 100);
    });
    // END CHOOSE DATE

    // Booking provider
    $("#surveyForm").on("change", ".list_staff", function () {
        // Save form
        saveForm();
    });
    // End booking provider



    // Mask Input
    var plholder = phoneFormat == "(000) 000-0000" ? "Phone (___) ___-____" : "Phone ____ ___ ____";
    $(".inputPhone").mask(phoneFormat, {placeholder: plholder});
    // End mask input

    $("#filter li a").click(function(e){
        var id = $(this).attr("itemprop");
        e.preventDefault();

        // set active class
        $('#filter li').removeClass('active');
        $(this).parent("li").addClass("active");

        getGalleryByCat(id);
    });
    $("#filter li:first a").trigger("click");

    $("select[name='filter_select']").change(function(){
        var id = $(this).val();
        getGalleryByCat(id);
    });

    // $("select[name='filter_select']").trigger("change");
    // check form
    $(document).ready(function(){
        $.ajax({
            type: "post",
            url: "/security/create",
            success: function(token)
            {
                $("form").each(function(){
                    $(this).prepend("<input type='hidden' name='token' value='"+token+"' />");
                });
            }
        });
    });

    /*Anchor link*/
    $('[href^="#"]').on("click", function (event) {
        let _h = $(this).attr('href');
        let _hsplit = _h.substr(1, _h.length);
        if ( _hsplit != 'open_booking' ) {
            event.preventDefault();
            scrollJumpto(_h, window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile');
        }
    });

})(jQuery);

function loadService(pg_id, _page)
{
    pg_id = pg_id ? pg_id :0;
    _page = _page ? _page :0;

    var btn_appointment = "";
    if(typeof(enable_booking) != "undefined" && enable_booking==1)
    {
        btn_appointment = "<a class='btn btn-primary btn_make_appointment' href='/book'>Make an appointment</a>";
    }
    $("ul.listcatser li").removeClass("ui-tabs-active ui-state-active");
    $("ul.listcatser li[lid='"+pg_id+"']").addClass("ui-tabs-active ui-state-active");
    $.ajax({
        type: "post",
        url: "/service/loadservice",
        data: {pg_id: pg_id, limit: num_paging, page: _page, paging: 1},
        beforeSend: function() {
            $(".content_service").html("Loading...");
        },
        success: function(html)
        {
            var obj = JSON.parse(html);
            $(".paging_service").html(obj.paging_ajax);
            var group_des = obj.group_des;
            obj = obj.data;
            if(obj.length > 0)
            {
                var html_row = '<ul id="all-item" class="services_item_ul_v1">';

                /*html_row += '<li class="item-botton services_item_v1 clearfix text-right">';
                html_row += btn_appointment;
                html_row += '<a class="btn btn-primary" style="margin-left:15px;" href="tel:' + company_phone + '"><span class="fa"><i class="fa fa-phone"></i></span><span class="title">Call now</span></a>';
                html_row += '</li>';*/

                if(group_des)
                {
                    html_row += '<li class="des_service" style="border-top: none; padding: 10px 0;">';
                    html_row += group_des;
                    html_row += '</li>';
                }

                /*var pull_right = "pull-right";
                if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                    pull_right = "";
                }*/

                for(x in obj)
                {
                    var price_show = obj[x].price_sell ? obj[x].price_sell : "";

                    html_row += '<li class="services_item_v1">';
                    html_row += '<div class="line_item_v1">';
                    html_row += '<div class="just_start_line">';
                    html_row += '<div class="box_title">';
                    html_row += '<span class="name_service_v1">'+obj[x].name+'</span>';
                    html_row += '<span class="price_service_v1">';
                    html_row += '<span class="curent">'+price_show+'</span><span class="up">'+obj[x].product_up+'</span>';
                    html_row += '</span>';
                    html_row += '</div>';
                    html_row += '<div class="box_des">'+obj[x].product_description+'</div>';
                    html_row += '</div>';
                    html_row += '</div>';
                    html_row += '</li>';
                }

                html_row += '</ul>';

                $(".content_service").html(html_row);

                $("#tabs li").removeClass("ui-corner-top").addClass("ui-corner-left");
                $('body, html').animate({
                    scrollTop: $(".box_service").offset().top-100
                }, 1000);
            }else
            {
                $(".content_service").html("No services found in this category");
            }
        }
    });
    // Load gallery right
    loadGallery(pg_id);
}

    function loadGallery(pg_id=0)
    {
        if(pg_id)
        {
            $.ajax({
                type: "post",
                url: "/service/loadgallery",
                data: {id:pg_id},
                beforeSend: function()
                {
                    // $(".box_show_gallery").html("Loading...");
                },
                success: function(html)
                {
                    // console.log(html);
                    var obj = JSON.parse(html);
                    var html_img = '';
                    for(var x in obj)
                    {
                        html_img +='<li><img itemprop="image" alt="" src="'+obj[x].image+'" class="img-responsive"></li>';
                    }

                    $(".box_show_gallery").html(html_img);
                }
            });
        }
    }

function saveForm()
{
    // Save form
    var formdata = $("#surveyForm").serialize();
    $.ajax({
        type: "post",
        url: "/book/saveform",
        data: formdata,
        success: function (html)
        {
            // console.log(html);
        }
    });
}

function loadForm(formdata)
{
    var obj = JSON.parse(formdata);
    $("input[name='booking_date']").val(obj.booking_date);
    $("input[name='booking_hours']").val(obj.booking_hours);
    var listservice = typeof (obj.service_staff) != "undefined" ? obj.service_staff : [];
    // console.log(listservice);
    if (listservice.length > 0)
    {
        for (var x in listservice)
        {
            // split info
            var list = listservice[x].split(',');
            // Trigger add row
            if (x > 0)
            {
                $(".addButton").trigger("click");
            }
            var objservice = $(".list_service:last");
            $(".list_service:last option[value='" + list[0] + "']").attr("selected", "selected");
            objservice.trigger("change");
            $(".list_staff:last option[value='" + list[1] + "']").attr("selected", "selected");

        }

        // Trigger action
        $(".btn_action").trigger("click");
    }
}

function convertDate(input)
{
    var list_date = input.split("/");
    var splitDate = posFormat.split(",");
    var new_date = list_date[splitDate[2]] + "/" + list_date[splitDate[1]] + "/" + list_date[splitDate[0]];
    return new_date;
}

function pushHtmlTime(input_date, type)
{
    $.ajax({
        type: "post",
        url: "/book/get_hours",
        data: {input_date: input_date, type: type},
        beforeSend: function(){
            $(".box_detail_info").append("<div class='mask_booking'><i class='fa fa-spinner fa-pulse fa-3x fa-fw'></i></div>");
            $(".box_detail_info").css("position","relative");
            $(".mask_booking").css("position","absolute").css("height","100%").css("width","100%").css("top",0).css("left",0).css("background","rgba(0,0,0,0.5)").css("text-align","right");
            $(".mask_booking i").css("font-size","2em").css("margin","10px");
        },
        success: function(response)
        {
            // console.log(response);
            // Remove mask
            $(".mask_booking").remove();
            var obj = JSON.parse(response);
            if(obj.checkmorning == false)
            {
                $(".note_am_time").html("(Booking time has expired)");
            }else
            {
                $(".note_am_time").html("");
            }

            if(obj.checkafternoon == false)
            {
                $(".note_pm_time").html("(Booking time has expired)");
            }else
            {
                $(".note_pm_time").html("");
            }

            $(".databooktime .timemorning").html(obj.htmlMorning);
            $(".databooktime .timeafternoon").html(obj.htmlAfternoon);
        }
    });
}

function setHtmldate(date_choose)
{
    // use for booking
    var new_date = convertDate(date_choose);
    var d = new Date(new_date);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var str_show = days[d.getDay()] + ", " + months[d.getMonth()] + "-" + d.getDate() + "-" + d.getFullYear();
    // console.log(str_show);
    $(".time_show").html(str_show);
}

function loadEvent()
{
    $('#surveyForm')

            // Add button click handler
            .on('click', '.addButton', function () {
                var html_close = '<div class="removeButton"><img src="/public/library/global/remove-service-icon-new.png"></div>';
                var template = '<div class="item-booking">' + html_close + $('#optionTemplate').html() + '</div>';
                $(this).before($(template));
                $("#surveyForm .item-booking:last .list_service").trigger('change');
                saveForm();
            })

            // Remove button click handler
            .on('click', '.removeButton', function () {
                var $row = $(this).parents('.item-booking'),
                        $option = $row.find('[name="option[]"]');

                // Remove element containing the option
                $row.remove();
                saveForm();
            })
}

function changeTimeByDate(input_date, typehtml)
    {
        // check date time
        var splitDate = posFormat.split(",");//1,0,2
        // change time
        $.ajax({
            type:"post",
            url: "/book/change_time",
            data: {date: input_date},
            success: function(response)
            {
                // console.log(response);
                if(response)
                {
                    var obj = JSON.parse(response);
                    timeMorning = JSON.stringify(obj.time_morning);
                    // convert time afternoon
                    var afternoon_time = obj.time_afternoon;
                    for(var x in afternoon_time)
                    {
                        var listTime = afternoon_time[x].split(":");

                        if(listTime[0] >=1 && listTime[0] < 12)
                        {
                            var changeTime = parseInt(listTime[0])+12;
                            afternoon_time[x] = changeTime+":"+listTime[1];
                        }
                    }
                    
                    timeAfternoon = JSON.stringify(afternoon_time);
                    pushHtmlTime(input_date, typehtml);
                }
            }
        });

    }

function isFreezeHeader ( wrapFreezeHeader , flagFreezeHeader, device) {
    let deviceName = device == 'mobile' ? 'mobile' : 'desktop';
    let wrapFreezeHeaderObj = $(wrapFreezeHeader);
    let flagFreezeHeaderObj = $(flagFreezeHeader);

    if( !flagFreezeHeaderObj.hasClass('initializedFreezeHeader') && wrapFreezeHeaderObj.length > 0 && flagFreezeHeaderObj.length > 0 ){
        flagFreezeHeaderObj.addClass('initializedFreezeHeader');
        wrapFreezeHeaderObj.addClass(`fixed-freeze ${deviceName}`);

        $('.btn_service_book').addClass('fixed-scroll');

        let insteadFreezeHeaderObj = $(`<div class="instead-flag-freeze-header ${deviceName}"></div>`);
        insteadFreezeHeaderObj.insertBefore(flagFreezeHeaderObj);

        $(window).scroll(function(){
            if( wrapFreezeHeaderObj.is_on_scroll1() ){
                flagFreezeHeaderObj.removeClass(`freeze-header with-bg ${deviceName}`);
                insteadFreezeHeaderObj.height('0px');
            } else {
                insteadFreezeHeaderObj.height(flagFreezeHeaderObj.outerHeight()+'px');
                flagFreezeHeaderObj.addClass(`freeze-header with-bg ${deviceName}`);
            }
        });
    }
}
$(document).ready(function () {


    /*FREEZE HEADER*/
    $.fn.is_on_scroll1 = function() {
        /* Not included margin, padding of window */
        let win = $(window);
        let viewport = {
            top : win.scrollTop(),
            left : win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        /* Not included margin of this element: same container */
        let bounds = this.offset();
        if ( typeof bounds == 'undefined' ) {return false;}
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        if ( bounds.top >= viewport.top && bounds.bottom <= viewport.bottom ) {
            return true;
        } else {
            return false;
        }
    };
    let activeFreezeHeader = $('[name="activeFreezeHeader"]').val();
    if( activeFreezeHeader == 1 || activeFreezeHeader == 3 ){
        isFreezeHeader ( '.wrap-freeze-header' , '.flag-freeze-header');
    }

    if( activeFreezeHeader == 1 || activeFreezeHeader == 2 ){
        isFreezeHeader ( '.wrap-freeze-header-mobile' , '.flag-freeze-header-mobile', 'mobile');
    }

    $(window).load(function() {
        if ( $('.animation_sroll_jumpto .sroll_jumpto').length > 0 ) {
            scrollJumpto('#sci_' + $('input[name="group_id"]').val(), window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile');
        }
    });
});

function scrollJumpto ( jumpto, headerfixed, redirect )
{
    // check exits element for jumpto
    if ( $(jumpto).length > 0 )
    {
        // Calculator position and call jumpto with effect
        jumpto = $(jumpto).offset().top;
        headerfixed = ( $(headerfixed).length > 0 ) ? $(headerfixed).height() : 100;

        $('html, body').animate({
            scrollTop: parseInt(jumpto - headerfixed) + 'px'
        }, 1000, 'swing');
    }
    // Check redirect if not exits element for jumpto
    else if ( redirect )
    {
        // Call redirect
        redirectUrl(redirect);
        return;
    }
    else
    {
        console.log(jumpto + ' Not found.');
    }
}

function setEqualSlideHeight(selector) {

    $(selector).show();

    var heights = [];
    var widths = [];

    $(selector).each(function() {
        heights.push($(this).find('img').height());
        widths.push($(this).find('img').width());
    });

    var maxheights = 660;
    if ( heights.length > 0 ) {
        maxheights = Math.max.apply( Math, heights );
    }

    var maxwidths = 1170;
    if ( widths.length > 0 ) {
        maxwidths = Math.max.apply( Math, widths );
    }

    $('.tp-banner').revolution({
        delay: 10000,
        hideThumbs: 10,
        startwidth: maxwidths,
        startheight: maxheights,
    });

    $(selector).hide();
}

function initGalleryTab( elementTab, elementContent ) {
    let objTab = $(elementTab);

    objTab.on("click", ".tab", function () {
        let _this = $(this);
        let id = _this.attr("data-id");

        // Class active
        objTab.find('.tab').removeClass('active');
        _this.addClass("active");

        getGalleryByCat(id, 1, elementContent);
    });

    // First load
    objTab.find('.tab').first().trigger('click');
}

function getGalleryByCat(cat_id, page, elementContent) {
    cat_id = cat_id ? cat_id : 0;
    page = page ? page : 0;

    let objContent = $(elementContent);
    let mask_loading_obj = $('<div class="mask_booking" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');

    $.ajax({
        type: "post",
        url: "/gallery/getlistbycat",
        beforeSend: function () {
            objContent.append(mask_loading_obj);
        },
        data: {cat_id: cat_id, page: page, blockId: elementContent},
        success: function (response) {
            let obj = JSON.parse(response);

            let html = `<div class="m-gallery-box-wrap">`;

            if ( obj.data.length > 0 ) {
                html += `<div class="row">`;
                for (var x in obj.data) {
                    html += `
                    <div class="col-xs-6 col-sm-6 col-md-4">
                        <div class="pointer m-magnific-popup" data-group="gallery-${cat_id}" 
                             title="${obj.data[x].name}" href="${obj.data[x].image}">
                            <div class="m-gallery-box">
                                <div class="m-image-bg" style="background-image: url('${obj.data[x].imageThumb}');">
                                    <img itemprop="image" src="${obj.data[x].imageThumb}" alt="${obj.data[x].image_alt}">
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }
                html += `</div>`;
            } else {
                html = "Not found gallery item in this category.";
            }
            html += `</div>`;

            objContent.find('.listing').html(html);
            objContent.find('.paging').html(obj.paging_ajax);
            initImageMagnificPopup('.m-magnific-popup');
        },
        complete: function () {
            mask_loading_obj.remove();
        }
    });
}
$(document).ready(function () {
    /*GALLERY TAB*/
    initGalleryTab('#category_tab', '#gallery_content');

    /*GALLERY SLIDER HOME*/
    $("#sale-slider2").owlCarousel({
        loop: true,
        margin: 0,
        dots: false,
        nav: true,
        navText: ['<i class="fa fa-angle-left"></i>','<i class="fa fa-angle-right"></i>'],
        smartSpeed: 500,
        autoplay: true,
        autoplayTimeout: 3000,
        items: 1,
        responsive:{
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        },
        /*animateOut: 'slideOutUp',
        animateIn: 'slideInUp',*/
    });

    /*TESTIMONIAL SLIDER HOME*/
    let testimonialCarousel = $('.testimonial-carousel');
    if (testimonialCarousel.length > 0) {
        testimonialCarousel.owlCarousel({
            loop: false,
            autoplay: false,
            autoPlayTimeout: 1000,
            margin: 60,
            dots: true,
            nav: true,
            navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            items: 1,
        });
    }
});

function load_social(inputs) {
    if ( !inputs ) {
        console.log('load social missed inputs');
        return false;
    }

    /*calculator width*/
    let social_block_width = $('#social_block_width').width();
    social_block_width = Math.round(social_block_width);

    if (social_block_width > 450) {
        social_block_width = 450;
    }

    if ( social_block_width < 180 ){
        social_block_width = 180;
    }

    /*facebook fanpage*/
    if ( typeof inputs.facebook_embed != 'undefined' && inputs.facebook_embed ) {
        let social_block_height = Math.round(social_block_width * (parseInt(inputs.facebook_embed.height)/parseInt(inputs.facebook_embed.width)));
        let  social_url = '';
        if (!inputs.facebook_embed.likebox_enable) {
            social_url += 'https://www.facebook.com/plugins/page.php?';
            social_url += '&width=' + social_block_width + '&height=' + social_block_height;
            social_url += '&small_header='+(inputs.facebook_embed.small_header ? 'true' : 'false');
            social_url += '&tabs='+inputs.facebook_embed.tabs;
            social_url += '&show_facepile='+(inputs.facebook_embed.show_facepile ? 'true' : 'false');
            social_url += '&hide_cover=false&hide_cta=false&adapt_container_width=true';
        } else {
            social_url += 'https://www.facebook.com/plugins/likebox.php?';
            social_url += '&width=' + social_block_width + '&height=' + social_block_width; // If set height then error with likebox
            social_url += '&show_faces='+(inputs.facebook_embed.likebox_show_faces ? 'true' : 'false');
            social_url += '&stream='+(inputs.facebook_embed.likebox_stream ? 'true' : 'false');
            social_url += '&header=false';
        }
        social_url += '&href=' + encodeURIComponent(inputs.facebook_embed.id_fanpage);
        social_url += '&appId' + inputs.facebook_embed.appId;

        $('#fanpage_fb_container').html('<iframe style="overflow:hidden;max-height:' + social_block_height + 'px" title="Social fanpage" src="'+social_url+'" width="' + social_block_width + '" height="' + social_block_height + '" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true"></iframe>');
    }

    /*google fanpage*/
    if (typeof inputs.google_id_fanpage != 'undefined' && inputs.google_id_fanpage) {
        $('#fanpage_google_container').html('<div class="g-page" data-href="' + inputs.google_id_fanpage + '" data-width="' + social_block_width + '"></div><script src="https://apis.google.com/js/platform.js" async defer><\/script>');
    }

    /*twitter fanpage*/
    $('#fanpage_twitter_container').html(''); // clear content
    if (typeof inputs.twitter_id_fanpage != 'undefined' && inputs.twitter_id_fanpage) {
        inputs.twitter_id_fanpage = inputs.twitter_id_fanpage.split('/');
        for (let i = inputs.twitter_id_fanpage.length - 1; i >= 0; i -= 1) {
            if (inputs.twitter_id_fanpage[i] != '') {
                inputs.twitter_id_fanpage = inputs.twitter_id_fanpage[i];
                break;
            }
        }
        if (typeof twttr != 'undefined') {
            twttr.widgets.createTweet(inputs.twitter_id_fanpage, document.getElementById('fanpage_twitter_container'), {width: social_block_width});
        }
    }
}

$(document).ready(function () {
    /*
    * SOCIAL FAN PAGE
    * When resize then reload fanpage
    * Firing resize event only when resizing is finished
    */
    let socialInputs = {
        facebook_embed: facebook_embed,
        google_id_fanpage: google_id_fanpage,
        twitter_id_fanpage: twitter_id_fanpage,
    };
    $(window).load(function() {
        load_social(socialInputs);
        $(window).on('resize', function () {
            clearTimeout(window.resizedFinished);
            window.resizedFinished = setTimeout(function () {
                load_social(socialInputs);
            }, 250);
        });
    });
});