// 'use strict';

var translations = `{
  "EN": [
    {"id":"switchlocalization",         "property":"innerHTML",   "translation":"EN"},
    {"id":"softwarename",               "property":"innerHTML",   "translation":"Sales and Inventory Control System"},
    {"id":"checkissuesbutton",          "property":"title",       "translation":"Show all products with issues"},
    {"id":"checkmessagesbutton",        "property":"title",       "translation":"Show all events or messages"},
    {"id":"switchlocalization",         "property":"title",       "translation":"Switch language"},
    {"id":"sysinfo",                    "property":"title",       "translation":"System Info and Settings"},
    {"id":"licensetext",                "property":"title",       "translation":"This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License"},
    {"id":"setmonitoring",              "property":"title",       "translation":"Enable/Disable product monitoring"},
    {"id":"setoutofstock",              "property":"title",       "translation":"Mark/Unmark if product is out of stock"},
    {"id":"number",                     "property":"placeholder", "translation":"SKU"},
    {"id":"name",                       "property":"placeholder", "translation":"Name"},
    {"id":"quantity",                   "property":"placeholder", "translation":"Quantity"},
    {"id":"warehouseqty",               "property":"placeholder", "translation":"Warehouse Qty"},
    {"id":"contractor",                 "property":"placeholder", "translation":"Contractor"},
    {"id":"price",                      "property":"placeholder", "translation":"Price"},
    {"id":"sellnumber",                 "property":"placeholder", "translation":"Name"},
    {"id":"sellquantity",               "property":"placeholder", "translation":"Quantity"},
    {"id":"customernames",              "property":"placeholder", "translation":"Customer names"},
    {"id":"customerphonenumber",        "property":"placeholder", "translation":"Customer Phone Number"},
    {"id":"customeraddress",            "property":"placeholder", "translation":"Customer Address"},
    {"id":"trackingnumber",             "property":"placeholder", "translation":"Tracking Number"},
    {"id":"prodpicuploadbuttontext",    "property":"textContent", "translation":"Choose product pictures"},
    {"id":"changeprodpicbuttontext",    "property":"textContent", "translation":"Change product picture"},
    {"id":"labelone",                   "property":"innerHTML",   "translation":"Products"},
    {"id":"labeltwo",                   "property":"innerHTML",   "translation":"Sell"},
    {"id":"labelthree",                 "property":"innerHTML",   "translation":"Restock"},
    {"id":"labelfour",                  "property":"innerHTML",   "translation":"Customer Banlist"},
    {"id":"checkproduct",               "property":"innerHTML",   "translation":"Check"},
    {"id":"addproduct",                 "property":"innerHTML",   "translation":"Add"},
    {"id":"sellproduct",                "property":"innerHTML",   "translation":"Sell"},
    {"id":"customerbanlist",            "property":"innerHTML",   "translation":"Search"},
    {"id":"bancustomer",                "property":"innerHTML",   "translation":"Ban"},
    {"id":"restockproduct",             "property":"innerHTML",   "translation":"Restock"},
    {"id":"restocknumber",              "property":"placeholder", "translation":"SKU"},
    {"id":"restockquantity",            "property":"placeholder", "translation":"Quantity"},
    {"id":"itemreturnedlabel",          "property":"innerHTML",   "translation":"Returned"},
    {"id":"restockwarehouseproduct",    "property":"innerHTML",   "translation":"Warehouse Restock"},
    {"id":"restockwarehousenumber",     "property":"placeholder", "translation":"SKU"},
    {"id":"restockwarehousequantity",   "property":"placeholder", "translation":"Warehouse Qty"},
    {"id":"soldina",                    "property":"textContent", "translation":"-Choose where it was sold-"},
    {"id":"soldinstore",                "property":"textContent", "translation":"STORE"},
    {"id":"soldinsite",                 "property":"textContent", "translation":"SITE"},
    {"id":"soldinfb",                   "property":"textContent", "translation":"Facebook"},
    {"id":"soldinolx",                  "property":"textContent", "translation":"OLX"},
    {"id":"soldinbazar",                "property":"textContent", "translation":"Bazar.BG"},
    {"id":"soldinphone",                "property":"textContent", "translation":"Telephone"},
    {"id":"soldinviber",                "property":"textContent", "translation":"Viber"},
    {"id":"datesinfo",                  "property":"textContent", "translation":"Choose a sales period or directly click for the daily ones"},
    {"id":"wherewasordereda",           "property":"textContent", "translation":"-Choose where it was ordered-"},
    {"id":"wherewasorderedsite",        "property":"textContent", "translation":"SITE"},
    {"id":"wherewasorderedfb",          "property":"textContent", "translation":"Facebook"},
    {"id":"wherewasorderedolx",         "property":"textContent", "translation":"OLX"},
    {"id":"wherewasorderedbazar",       "property":"textContent", "translation":"Bazar.BG"},
    {"id":"wherewasorderedphone",       "property":"textContent", "translation":"Telephone"},
    {"id":"wherewasorderedviber",       "property":"textContent", "translation":"Viber"}
  ],
  "BG": [
    {"id":"switchlocalization",         "property":"innerHTML",   "translation":"BG"},
    {"id":"softwarename",               "property":"innerHTML",   "translation":"Система за контрол на продажбите и наличностите"},
    {"id":"checkissuesbutton",          "property":"title",       "translation":"Покажи всички продукти с проблеми"},
    {"id":"checkmessagesbutton",        "property":"title",       "translation":"Покажи всички съобщения или събития"},
    {"id":"switchlocalization",         "property":"title",       "translation":"Смяна език на интерфейса"},
    {"id":"sysinfo",                    "property":"title",       "translation":"Системна информация и настройки"},
    {"id":"licensetext",                "property":"title",       "translation":"Този софтуер се разпространява под CC BY-NC-SA 4.0 лицензно споразумение"},
    {"id":"setmonitoring",              "property":"title",       "translation":"Добави/Премахни продукта от списъка с наблюдавани"},
    {"id":"setoutofstock",              "property":"title",       "translation":"Маркирай продукта като изчерпан/в наличност"},
    {"id":"number",                     "property":"placeholder", "translation":"Артикулен номер"},
    {"id":"name",                       "property":"placeholder", "translation":"Име на продукта"},
    {"id":"quantity",                   "property":"placeholder", "translation":"Брой"},
    {"id":"warehouseqty",               "property":"placeholder", "translation":"В склада"},
    {"id":"contractor",                 "property":"placeholder", "translation":"Доставчик"},
    {"id":"price",                      "property":"placeholder", "translation":"Цена"},
    {"id":"sellnumber",                 "property":"placeholder", "translation":"Артикулен номер"},
    {"id":"sellquantity",               "property":"placeholder", "translation":"Брой"},
    {"id":"customerphonenumber",        "property":"placeholder", "translation":"Телефонен номер на клиента"},
    {"id":"customernames",              "property":"placeholder", "translation":"Имена на клиента"},
    {"id":"customeraddress",            "property":"placeholder", "translation":"Адрес на клиента"},
    {"id":"trackingnumber",             "property":"placeholder", "translation":"Номер на товарителница"},
    {"id":"prodpicuploadbuttontext",    "property":"textContent", "translation":"Добави снимка"},
    {"id":"changeprodpicbuttontext",    "property":"textContent", "translation":"Смени снимката на продукта"},
    {"id":"labelone",                   "property":"innerHTML",   "translation":"Продукти"},
    {"id":"labeltwo",                   "property":"innerHTML",   "translation":"Продажби"},
    {"id":"labelthree",                 "property":"innerHTML",   "translation":"Зареждане"},
    {"id":"labelfour",                  "property":"innerHTML",   "translation":"Некоректни клиенти"},
    {"id":"checkproduct",               "property":"innerHTML",   "translation":"ПРОВЕРИ"},
    {"id":"addproduct",                 "property":"innerHTML",   "translation":"ЗАПИС"},
    {"id":"sellproduct",                "property":"innerHTML",   "translation":"ОТЧЕТИ ПРОДАЖБА"},
    {"id":"customerbanlist",            "property":"innerHTML",   "translation":"ТЪРСИ"},
    {"id":"bancustomer",                "property":"innerHTML",   "translation":"ЗАПИС"},
    {"id":"restockproduct",             "property":"innerHTML",   "translation":"ЗАРЕДИ"},
    {"id":"restocknumber",              "property":"placeholder", "translation":"Артикулен номер"},
    {"id":"restockquantity",            "property":"placeholder", "translation":"Брой"},
    {"id":"itemreturnedlabel",          "property":"innerHTML",   "translation":"Върната"},
    {"id":"restockwarehouseproduct",    "property":"innerHTML",   "translation":"ЗАРЕДИ"},
    {"id":"restockwarehousenumber",     "property":"placeholder", "translation":"Артикулен номер"},
    {"id":"restockwarehousequantity",   "property":"placeholder", "translation":"Бройки в склада"},
    {"id":"soldina",                    "property":"textContent", "translation":"-Избери къде е продаден продукта-"},
    {"id":"soldinstore",                "property":"textContent", "translation":"МАГАЗИН"},
    {"id":"soldinsite",                 "property":"textContent", "translation":"САЙТ"},
    {"id":"soldinfb",                   "property":"textContent", "translation":"Фейсбук"},
    {"id":"soldinolx",                  "property":"textContent", "translation":"ОЛХ"},
    {"id":"soldinbazar",                "property":"textContent", "translation":"Базар.БГ"},
    {"id":"soldinphone",                "property":"textContent", "translation":"ТЕЛЕФОН"},
    {"id":"soldinviber",                "property":"textContent", "translation":"Вайбър"},
    {"id":"datesinfo",                  "property":"textContent", "translation":"Изберете период или натиснете директно някой от бутоните за дневните продажби"},
    {"id":"wherewasordereda",           "property":"textContent", "translation":"-Избери от къде е поръчан продукта-"},
    {"id":"wherewasorderedsite",        "property":"textContent", "translation":"САЙТ"},
    {"id":"wherewasorderedfb",          "property":"textContent", "translation":"Фейсбук"},
    {"id":"wherewasorderedolx",         "property":"textContent", "translation":"ОЛХ"},
    {"id":"wherewasorderedbazar",       "property":"textContent", "translation":"Базар.БГ"},
    {"id":"wherewasorderedphone",       "property":"textContent", "translation":"ТЕЛЕФОН"},
    {"id":"wherewasorderedviber",       "property":"textContent", "translation":"Вайбър"}
  ]
}`;

/*---*/

var systemErrors = [];
systemErrors['EN'] = [];
systemErrors['BG'] = [];
systemErrors['EN']['addprod']     = [];
systemErrors['EN']['changepic']   = [];
systemErrors['EN']['searchprod']  = [];
systemErrors['EN']['sellprod']    = [];
systemErrors['EN']['restock']     = [];
systemErrors['EN']['issues']      = [];
systemErrors['BG']['addprod']     = [];
systemErrors['BG']['changepic']   = [];
systemErrors['BG']['searchprod']  = [];
systemErrors['BG']['sellprod']    = [];
systemErrors['BG']['restock']     = [];
systemErrors['BG']['issues']      = [];
/*---*/
systemErrors['EN']['addprod'][0]    = "This product is already in the database!";
systemErrors['EN']['addprod'][1]    = "The product was succesfully added!";
systemErrors['EN']['changepic'][0]  = "Product's picture wasn't changed!";
systemErrors['EN']['changepic'][1]  = "Product's picture was changed!";
systemErrors['EN']['searchprod'][0] = "The product wasn't found in the database!";
systemErrors['EN']['sellprod'][0]   = "The product wasn't found in the database!";
systemErrors['EN']['sellprod'][1]   = "The product was succesfully marked as sold!";
systemErrors['EN']['restock'][0]    = "The product wasn't found in the database!";
systemErrors['EN']['restock'][1]    = "The product's quantity was succesfully updated!";
systemErrors['EN']['issues'][0]     = "No products with low qty or missing info were found!";
systemErrors['BG']['addprod'][0]    = "Продукт със същия арт. номер е вече качен!";
systemErrors['BG']['addprod'][1]    = "Продуктът беше успешно добавен!";
systemErrors['BG']['changepic'][0]  = "Снимката на продукта не беше обновена!";
systemErrors['BG']['changepic'][1]  = "Снимката на продукта беше успешно обновена!";
systemErrors['BG']['searchprod'][0] = "Продуктът не беше открит в базата данни!";
systemErrors['BG']['sellprod'][0]   = "Продуктът не беше открит в базата данни!";
systemErrors['BG']['sellprod'][1]   = "Продуктът беше успешно записан като продаден!";
systemErrors['BG']['restock'][0]    = "Продуктът не беше открит в базата данни!";
systemErrors['BG']['restock'][1]    = "Продуктовата наличност беше успешно обновена!";
systemErrors['BG']['issues'][0]     = "Не бяха открити продукти с намалено количество или липсваща информация!";
/*---*/
var currency = [];
currency['EN'] = "(in EUR)";
currency['BG'] = "(в лeвa)";
var warehouseChat = [];
warehouseChat['EN'] = "qty";
warehouseChat['BG'] = "бр";
