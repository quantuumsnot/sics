# sics
Sales and Inventory Control System v0.6 codename "School bullies"


This web-based system works and locally using PHP's built-in server (started in project's directory):
php -S 127.0.0.1:65000 (assuming 65000 is not used network port)


TODO list:
1. ~~Manual or automatic check for products that are almost 'out of stock'~~
2. ~~Automatic check for missing product info or pictures~~
3. Server-side input filtering and sanitization ... because hackers
4. Database replication on-the-fly (sometimes hard drives die, you know)
5. User authentication and access levels ... because stupid users
6. UI improvements (I feel this will be a long battle against CSS)
7. Database encryption (if it's plausible in SQLite)
8. Finding where is my left sock (the grayish one that was whitey 3 years ago)
9. World domination
10. ~~Do nothing~~
11. Uploading products from SITE/excel/json/txt lists - from SITE it'll probably be a custom html scraping script
12. Integration with the popular online shopping platforms - probably a browser extension solution that will hook to the UI (this is huge and time consuming)
13. ~~Customer banlist feature ... because those rats deserve it!~~
14. Security and performance tests (y'all just buy faster computors)
15. ~~Sales report by the end of the day or per given date range~~
16. ~~Website localization ... sort of ~~
17. Almost forgot about adding the feature for product updates like price, info, etc ... My bad
18. Sales statistics (almost forgot this feature, it's very important according to traders)
19. Automated competition intelligence (Also very important feature, it's mainly an item price comparison against other sites)
20. ~~Restocking~~ and generating restock order feature - automatic ordering of low in stock products and updating quantities at their arrival
21. Product label generator
22. ~~Manual check if the item that'll be uploaded, is already in the database (less input fields that must be filled by hand)~~
23. At product upload automatically save (and web optimize) the picture(s) in 'productpics' dir using SKU number as filename  (while backing up the original file)
24. Add feature allowing to restock product which is already sold but RMA'ed for one or another reason (buyer not picking it, changed for a different product, etc)
25. Full step-by-step CONSTANTLY UPDATED documentation about how to install and setup OS, web-server, database and the programming language for that project
