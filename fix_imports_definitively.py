import re

with open('src/components/clima/DashboardBento.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('import { MdAssessment } from "react-icons/md";', 'import { MdAssessment, MdAdd, MdRemove } from "react-icons/md";')

with open('src/components/clima/DashboardBento.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Imports definitively fixed!")
