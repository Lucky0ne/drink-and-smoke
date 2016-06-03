/**
 * Created by igorgo on 27.05.2016.
 */

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]);
};

var validatorOptions = {
    custom: {
        vgzerro: function ($el) {
            if ($el.val()) return $el.val() > 0;
            else return true;
        }
    },
    errors: {
        vgzerro: 'Число должно быть больше нуля'
    }
};

var prodCodesCache = {}, o = {}, goodsCache = [];

function getProdCodes(t) {
    return new Promise(function (resolve, reject) {
        $.get("/data/prodcodes/" + t)
            .done(function (d) {
                    if (t === "A") prodCodesCache.A = d;
                    else if (t === "T") prodCodesCache.T = d;
                    resolve();
                }
            )
            .fail(reject);
    });
}

function getGoods() {
    return new Promise(function (resolve, reject) {
        $.get("/data/goods")
            .done(function (d) {
                    goodsCache = d;
                    resolve();
                }
            )
            .fail(reject);
    });
}

function initPageObjects() {
    o.formIncome = $("#income-form");
    o.formIncome.date = o.formIncome.find("#income-date");
    o.formIncome.good =  o.formIncome.find("#income-good-name");
    o.formIncome.quant =  o.formIncome.find("#income-good-quant");
    o.formIncome.add =  o.formIncome.find("#income-button-add-good");
    o.tableIncome = $("#income-table");

    o.formOutcome = $("#outcome-form");
    o.formOutcome.date = o.formOutcome.find("#outcome-date");
    o.formOutcome.good =  o.formOutcome.find("#outcome-good-name");
    o.formOutcome.quant =  o.formOutcome.find("#outcome-good-quant");
    o.formOutcome.add =  o.formOutcome.find("#outcome-button-add-good");
    o.tableOutcome = $("#outcome-table");

    o.formTurns = $('section#turns');
    o.formTurns.period = o.formTurns.find('#turns-period');

    o.modalDelete = $("#confirm-delete");
    o.modalDelete.ok = o.modalDelete.find("#conf-del-ok");
    o.modalDelete.cancel = o.modalDelete.find("#conf-del-cancel");
    o.modalDelete.errMsg = o.modalDelete.find("#conf-del-error");

    o.modalGood = $("#good-edit-dialog");
    o.formGood = o.modalGood.find("#good-edit-form");
    o.formGood.prodType = o.formGood.find("input:radio[name='good-edit-type']");
    o.formGood.prodCode = o.formGood.find("#good-edit-code");
    o.formGood.name = o.formGood.find("#good-edit-name");
    o.formGood.volume = o.formGood.find("#good-edit-volume");
    o.formGood.ok = o.formGood.find("#good-edit-ok");
    o.formGood.cancel = o.formGood.find("#good-edit-cancel");
    o.formGood.errMsg = o.formGood.find("#good-edit-error");

    o.modalOper = $("#oper-edit-dialog");
    o.formOper = o.modalOper.find("#oper-edit-form");
    o.formOper.title = o.modalOper.find("#oper-edit-dialog-title");
    o.formOper.date = o.formOper.find("#oper-date");
    o.formOper.good = o.formOper.find("#oper-good-name");
    o.formOper.quant = o.formOper.find("#oper-good-quant");
    o.formOper.ok = o.formOper.find("#oper-edit-ok");
    o.formOper.cancel = o.formOper.find("#oper-edit-cancel");
    o.formOper.errMsg = o.formOper.find("#oper-edit-error");

    o.btnAddGood = $(".add-good-button");
    o.combosGoods = $(".good-combo");
}

function initNavigation() {
    // jQuery to collapse the navbar on scroll
    function collapseNavbar() {
        if ($(".navbar").offset().top > 50) {
            $(".navbar-fixed-top").addClass("top-nav-collapse");
        } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
        }
    }

    $(window).scroll(collapseNavbar);
    $(document).ready(collapseNavbar);

// Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function () {
        if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
            $('.navbar-toggle:visible').click();
        }
    });

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
}

function initTables() {
    o.tableIncome.bootstrapTable({
        showHeader: false,
        classes: "table table-no-bordered",
        locale: "ru_RU",
        columns: [
            {
                field: "sgood",
                align: "left"
            },
            {
                field: "sprodcode",
                align: "left"
            },
            {
                field: "quant",
                align: "right"
            },
            {
                align: 'center',
                events: {
                    'click .del-income-row': function (e, value, row) {
                        o.modalDelete.data("operType", "I");
                        o.modalDelete.data("row", row);
                        o.modalDelete.modal('show');
                    },
                    'click .edit-income-row': function (e, value, row) {
                        o.modalOper.data("operType", "I");
                        o.modalOper.data("row", row);
                        o.modalOper.data("date", o.formIncome.date.val());
                        o.modalOper.modal('show');
                    }
                },
                formatter: function (value, row) {
                    var enbl = (row.closed === 'N');
                    return [
                        '<a class="edit-income-row btn btn-', enbl ? 'primary' : 'default', ' btn-xs ', enbl ? '' : 'disabled',
                        ' " href="javascript:void(0)" ', enbl ? 'title="Исправить"' : '', '>',
                        '<i class="fa fa-pencil" aria-hidden="true"></i></a>',
                        '<a class="del-income-row btn btn-', enbl ? 'danger' : 'default', ' btn-xs ', enbl ? '' : 'disabled',
                        ' " href="javascript:void(0)" ', enbl ? 'title="Удалить"' : '', '>',
                        '<i class="fa fa-trash" aria-hidden="true"></i></a>'
                    ].join('');

                }
            }
        ]
    });
    o.tableOutcome.bootstrapTable({
        showHeader: false,
        classes: "table table-no-bordered",
        locale: "ru_RU",
        columns: [
            {
                field: "sgood",
                align: "left"
            },
            {
                field: "sprodcode",
                align: "left"
            },
            {
                field: "quant",
                align: "right"
            },
            {
                align: 'center',
                events: {
                    'click .del-outcome-row': function (e, value, row) {
                        o.modalDelete.data("operType", "O");
                        o.modalDelete.data("row", row);
                        o.modalDelete.modal('show');
                    },
                    'click .edit-outcome-row': function (e, value, row) {
                        o.modalOper.data("operType", "O");
                        o.modalOper.data("row", row);
                        o.modalOper.data("date", o.formOutcome.date.val());
                        o.modalOper.modal('show');
                    }
                },
                formatter: function (value, row) {
                    var enbl = (row.closed === 'N');
                    return [
                        '<a class="edit-outcome-row btn btn-', enbl ? 'primary' : 'default', ' btn-xs ', enbl ? '' : 'disabled',
                        ' " href="javascript:void(0)" ', enbl ? 'title="Исправить"' : '', '>',
                        '<i class="fa fa-pencil" aria-hidden="true"></i></a>',
                        '<a class="del-outcome-row btn btn-', enbl ? 'danger' : 'default', ' btn-xs ', enbl ? '' : 'disabled',
                        ' " href="javascript:void(0)" ', enbl ? 'title="Удалить"' : '', '>',
                        '<i class="fa fa-trash" aria-hidden="true"></i></a>'
                    ].join('');

                }
            }
        ]
    });
}

function bindEvents() {
    initNavigation();
    o.formGood.prodCode.bind("resetValue", function (event) {
        var elc = $(this).data('combobox');
        elc.clearTarget();
        elc.triggerChange();
        elc.clearElement();
    });
    o.formGood.prodCode.bind("fillOptions", function (event) {
        var el = $(this);
        el.find("option").remove().end();
        el.append($("<option></option>"));
        el.trigger("resetValue");
        var vals;
        var prodType = el.data("prodType");
        if (prodType === "A") vals = prodCodesCache.A;
        else if (prodType === "T") vals = prodCodesCache.T;
        else vals = prodCodesCache.A.concat(prodCodesCache.T);
        $.each(vals, function (index, value) {
            //noinspection JSUnresolvedVariable
            el.append($("<option></option>")
                .attr("value", value.rowid)
                .text(value.code + " - " + value.name));
        });
        el.data('combobox').refresh();
    });
    o.combosGoods.bind("resetValue", function (event) {
        var elc = $(this).data('combobox');
        elc.clearTarget();
        elc.triggerChange();
        elc.clearElement();
    });
    o.combosGoods.bind("fillOptions", function (event) {
        var el = $(this);
        el.find("option").remove().end();
        el.append($("<option></option>"));
        el.trigger("resetValue");
        $.each(goodsCache, function (index, value) {
            //noinspection JSUnresolvedVariable
            el.append($("<option></option>")
                .attr("value", value.id)
                .text(value.name + " - " + value.volume + " (" + value.prodcode + "-" + value.prodname + ")"));
        });
        el.data('combobox').refresh();
    });
    o.combosGoods.bind("setValue", function (e, value) {
        $(this).val(value);
        $(this).data('combobox').refresh();
    });
    o.formGood.prodType.bind("click", function () {
        var v = $(this).val();
        var e = o.formGood.prodCode;
        if (e.data("prodType") != v) e.data("prodType", v).trigger("fillOptions");
    });
    o.btnAddGood.bind("click", function () {
        o.modalGood.modal("show");
    });
    o.modalGood.bind("hidden.bs.modal", function () {
        o.formGood.validator('destroy');
        o.formGood.errMsg.text("");
        o.formGood.prodCode.trigger("resetValue");
        o.formGood.name.val("");
        o.formGood.volume.val("0");
    });
    o.formGood.cancel.bind("click", function () {
        o.modalGood.modal('hide');
    });
    o.formGood.ok.bind("click", function () {
        o.formGood.errMsg.text("");
        o.formGood.validator('destroy');
        o.formGood.validator(validatorOptions);
        o.formGood.validator('validate');
        if (o.formGood.find(".has-error").length > 0) return false;
        $.ajax({
            type: 'PUT',
            data: {
                code: o.formGood.prodCode.val(),
                name: o.formGood.name.val(),
                volume: o.formGood.volume.val()
            },
            url: '/data/goods',
            dataType: 'JSON'
        }).done(function (resp) {
            goodsCache.push(resp);
            o.combosGoods.trigger("fillOptions");
            o.modalGood.modal('hide');
        }).fail(function (resp) {
            o.formGood.errMsg.text(resp.responseText);
        });

    });
    o.tableIncome.bind("dataChange", function () {
        var table = $(this);
        var date = o.formIncome.date.val();
        if (date) {
            $.get(
                "/data/operday/I/" + date
            ).done(function (data) {
                table.bootstrapTable("load", data);
            });
        } else {
            table.bootstrapTable("removeAll");
        }
    });
    o.tableOutcome.bind("dataChange", function () {
        var table = $(this);
        var date = o.formOutcome.date.val();
        if (date) {
            $.get(
                "/data/operday/O/" + date
            ).done(function (data) {
                table.bootstrapTable("load", data);
            });
        } else {
            table.bootstrapTable("removeAll");
        }
    });
    o.formIncome.date.bind("change", function () {
        o.tableIncome.trigger("dataChange");
    });
    o.formOutcome.date.bind("change", function () {
        o.tableOutcome.trigger("dataChange");
    });
    o.formIncome.add.bind("click", function () {
        o.formIncome.validator("destroy");
        o.formIncome.validator(validatorOptions);
        o.formIncome.validator('validate');
        if (o.formIncome.find(".has-error").length > 0) return false;
        $.ajax({
            type: 'PUT',
            data: {
                date: o.formIncome.date.val(),
                good: o.formIncome.good.val(),
                quant: o.formIncome.quant.val()
            },
            url: '/data/opers/income',
            dataType: 'JSON'
        }).done(function (resp) {
            o.tableIncome.bootstrapTable("prepend", [resp]);
            o.formIncome.validator("destroy");
            o.formIncome.good.trigger("resetValue");
            o.formIncome.quant.val("");
        });
    });
    o.formOutcome.add.bind("click", function () {
        o.formOutcome.validator("destroy");
        o.formOutcome.validator(validatorOptions);
        o.formOutcome.validator('validate');
        if (o.formOutcome.find(".has-error").length > 0) return false;
        $.ajax({
            type: 'PUT',
            data: {
                date: o.formOutcome.date.val(),
                good: o.formOutcome.good.val(),
                quant: o.formOutcome.quant.val()
            },
            url: '/data/opers/outcome',
            dataType: 'JSON'
        }).done(function (resp) {
            o.tableOutcome.bootstrapTable("prepend", [resp]);
            o.formOutcome.validator("destroy");
            o.formOutcome.good.trigger("resetValue");
            o.formOutcome.quant.val("");
        });
    });
    o.modalOper.bind("shown.bs.modal", function () {
        var typeText = (o.modalOper.data("operType") === "I") ? 'прихода' : 'расхода';
        o.formOper.title.text('Исправление ' + typeText);
        o.formOper.date.val(o.modalOper.data('date'));
        o.formOper.good.trigger('setValue', o.modalOper.data('row').ngood);
        o.formOper.quant.val(o.modalOper.data('row').quant);
    });
    o.modalOper.bind("hidden.bs.modal", function () {
        o.formOper.validator('destroy');
        o.formOper.errMsg.text("");
        o.formOper.title.text("");
        o.formOper.good.trigger("resetValue");
        o.formOper.date.val("");
        o.formOper.quant.val("");
    });
    o.formOper.cancel.bind("click", function () {
        o.modalOper.modal('hide');
    });
    o.formOper.ok.bind("click", function () {
        o.formOper.errMsg.text("");
        o.formOper.validator('destroy');
        o.formOper.validator(validatorOptions);
        o.formOper.validator('validate');
        if (o.formOper.find(".has-error").length > 0) return false;
        var id = o.modalOper.data('row').id;
        $.ajax({
            type: 'POST',
            data: {
                //id: o.modalOper.data('row').id,
                date: o.formOper.date.val(),
                good: o.formOper.good.val(),
                quant: o.formOper.quant.val()
            },
            url: '/data/opers/' + id,
            dataType: 'JSON'
        }).done(function (resp) {
            if (o.modalOper.data("operType") === "I") o.tableIncome.trigger("dataChange");
            else o.tableOutcome.trigger("dataChange");;
            o.modalOper.modal('hide');
        }).fail(function (resp) {
            console.log(resp);
            o.formOper.errMsg.text(resp.responseText);
        });

    });
    o.modalDelete.ok.bind("click", function () {
        console.log(o.modalDelete.data('row'));
        var id = o.modalDelete.data('row').id;
        $.ajax({
            type: 'DELETE',
            url: '/data/opers/' + id
        }).done(function () {
            if (o.modalDelete.data("operType") === "I") o.tableIncome.trigger("dataChange");
            else o.tableOutcome.trigger("dataChange");
            o.modalDelete.modal('hide');
        }).fail(function (resp) {
            console.log(resp);
            o.modalDelete.errMsg.text(resp.responseText);
        });

    });
    o.modalDelete.cancel.bind("click", function () {
        o.modalDelete.modal('hide');
    });
}

$(function () {
    initPageObjects();
    bindEvents();
    initTables();
    Promise.all([getProdCodes("A"), getProdCodes("T"), getGoods()])
        .then(function () {
            o.formGood.prodCode.combobox();
            o.formGood.prodType.filter(":checked").trigger("click");
            o.combosGoods.combobox();
            o.combosGoods.trigger("fillOptions");
            o.formIncome.removeClass("hidden");
            o.formOutcome.removeClass("hidden");
        })
        .catch (console.error);
    o.formIncome.date.val(new Date().yyyymmdd()).trigger("change");
    o.formOutcome.date.val(new Date().yyyymmdd()).trigger("change");
    o.formTurns.period.datepicker({
        format: "mm.yyyy",
        startView: 1,
        minViewMode: 1,
        maxViewMode: 2,
        language: "ru"
    });
});


