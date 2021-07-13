import pyautogui as pg 
import time
text = " *"
rows = 5
counter = rows
time.sleep(3)
while counter>0:
    time.sleep(0.1)
    pg.typewrite(text*counter)
    time.sleep(0.1)
    pg.press('enter')
    counter-=1
print("out")


