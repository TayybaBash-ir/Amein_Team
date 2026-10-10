import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the incorrect React import
c = c.replace('import { MdAdd, MdRemove, useEffect, useRef, useState } from "react";', 'import { useEffect, useRef, useState } from "react";')

# Inject into the correct react-icons/md block
if 'MdAdd' not in c:
    c = c.replace('import {\n  MdBookmarks,', 'import {\n  MdAdd,\n  MdRemove,\n  MdBookmarks,')

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Imports fixed!")
