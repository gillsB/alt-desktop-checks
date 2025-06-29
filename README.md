# alt-desktop-checks
tools for testing alt desktop installation/states.


# testIndexed.ts
Runs a lot of checks for backgrounds and checks to find if any are out of date, can't be found, can't read bg.json etc.  

Run this via:  
```tsc testIndexed.ts```  
then:  
```node testIndexed.js C:\Users\USERNAME_HERE\AppData\Roaming\AltDesktop\backgrounds.json C:\Users\USERNAME_HERE\AppData\Roaming\AltDesktop\backgrounds E:\test\ E:\test2\```  

Where the first argument C: path is the link to the backgrounds.json.  
Second argument is the link to the backgrounds default folder  
3rd+ arguments are the same directories in your external paths setting in the program. (Make sure you remove commas however).  
