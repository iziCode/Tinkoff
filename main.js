function pay(e) {
    total_cost();
    var t = e.email ? e.email.value : "",
        n = e.phone ? e.phone.value : "",
        i = e.name ? e.name.value : "",
        o = e.receipt ? e.receipt.value : "",
        a = e.DATA ? e.DATA.value : "",
        r = {
            TerminalKey: e.terminalkey.value,
            Amount: e.amount.value.replace('.', ''),
            OrderId: e.order ? e.order.value : "",
            Description: e.description ? e.description.value : "",
            Frame: 'true' == e.frame.value.toLowerCase(),
            Language: e.language.value.toLowerCase(),
            Phone: n,
            Email: t,
            Name: i
        },
        l = '';
    t && (l = 'Email=' + t),
    n && (l && (l += '|'),
        l = l + 'Phone=' + n), i && (l && (l += '|'),
        l = l + 'Name=' + i),
        a ? r.DATA = a + (l ? '|' + l : '') : l && (r.DATA = l),
    o && (r.Receipt = JSON.parse(o)),
        doPay(r)
}

function doPay(e) {
    if (e.OrderId || (e.OrderId = (new Date).getTime()), e.DATA) {
        if ("string" == typeof e.DATA) try {
            e.DATA = JSON.parse(e.DATA)
        } catch (t) {
            var n = {}, i = e.DATA.split('|');
            if (i.length > 0) {
                for (var o = 0, a = i.length; o < a; o++) {
                    var r = i[o].split('='), l = '';
                    r.length > 0 && (l = r[0].trim()) && (n[l] = r[1])
                }
                e.DATA = n
            } else delete e.DATA
        }

    }
    ;
    if (e.Receipt) {
        if ('string' == typeof e.Receipt && (e.Receipt = JSON.parse(e.Receipt)), !(e.Phone || e.Email || e.Receipt.Email || e.Receipt.Phone)) return void alert('Поле E-mail или Phone не должно быть пустым.');
        (e.Email || e.Receipt.Email) && (e.Receipt.Email = e.Email || e.Receipt.Email),
        (e.Phone || e.Receipt.Phone) && (e.Receipt.Phone = e.Phone || e.Receipt.Phone)
    }
    delete e.Name, delete e.Email, delete e.Phone; // delete e.DATA
    var TinkoffUrl = "https://securepay.tinkoff.ru/v2/Init";
    var d = new XMLHttpRequest;

    d.open("POST", TinkoffUrl, !0),
        d.setRequestHeader('Content-Type', 'application/json'),
        d.onreadystatechange = function () {
            if (4 == d.readyState && 200 == d.status) {
                var t = JSON.parse(d.responseText);
                if (0 == t.ErrorCode && t.Success) {
                    var n = t.PaymentURL;
                    e.Frame ? createFrame(n) : window.location.href = n
                } else alert("Извините, произошла ошибка при регистрации заказа. Ошибка: " + t.ErrorCode + " " + t.Message + " " + t.Details)
            }
        },
        d.send(JSON.stringify(e));
}

function total_cost() {
    var total = 0;
    $.each($('.cost'), function (index, value) {
        total += parseFloat($(value).val());
    });
    total = total.toFixed(2);
    $('#total').val(total);
    //------------------------------//

    var inputOrderPhone = "";
    var inputEmail = "";

    if ($("input[id='order-phone']").val() !== '') {
        inputOrderPhone = inputOrderPhone.concat($("input[id='order-phone']").val());
    }

    if ($("input[id='email']").val() !== '') {
        inputEmail = inputEmail.concat($("input[id='email']").val());

    }
    var receiptValue = '{"Email": "' + inputEmail + '","Phone": "' + inputOrderPhone + '",' +
        '"Taxation": "usn_income","Items": [ ';

    //------------------------------//

    var products_in_basket = document.getElementsByClassName('main_product_class');


    for (var i = 0; i < products_in_basket.length; i++) {
        var receipt_item_name = "";
        var receipt_item_price = "";
        var receipt_item_quantity = "";
        var receipt_item_amount = "";
        for (var j = 0; j < products_in_basket.item(i).children.length; j++) {
            switch (products_in_basket.item(i).children.item(j).className) {
                case 'product_name':
                    receipt_item_name = products_in_basket.item(i).children.item(j).innerHTML;
                    break;

                case 'product_description':

                    break;

                case 'product_price':
                    receipt_item_price = products_in_basket.item(i).children.item(j).children.item(0).value;
                    receipt_item_price = receipt_item_price.replace(".", "");
                    break;

                case 'product_quantity':
                    receipt_item_quantity = products_in_basket.item(i).children.item(j).children.item(1).value + '.00';
                    break;

                case 'product_amount_cost':
                    receipt_item_amount = products_in_basket.item(i).children.item(j).children.item(0).value;
                    receipt_item_amount = receipt_item_amount.replace(".", "");
                    break;

                default:
                    break;
            }
        }
        var receipt_item = '{"Name": "' + receipt_item_name + '", "Price": ' + receipt_item_price +
            ',"Quantity": ' + receipt_item_quantity + ',"Amount": ' + receipt_item_amount + ',"Tax": "none"}';
        if (i + 1 < products_in_basket.length) {
            receipt_item = receipt_item + ',';
        }
        if (receipt_item_quantity == '0.00' && i + 1 >= products_in_basket.length) {
            receiptValue = receiptValue.substr(0, receiptValue.length - 1);
        }
        if (receipt_item_quantity !== '0.00') {
            receiptValue = receiptValue + '' + receipt_item;
        }


    }
    receiptValue = receiptValue + ']}';

    $('#tinkoff_receipt').val(receiptValue);

}