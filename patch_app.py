import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_target = "import AdminPanel from './pages/AdminPanel';"
import_replacement = "import AdminPanel from './pages/AdminPanel';\nimport Store from './pages/Store';"
content = content.replace(import_target, import_replacement)

route_target = '          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />'
route_replacement = '          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />\n          <Route path="/store" element={<PrivateRoute><Store /></PrivateRoute>} />'
content = content.replace(route_target, route_replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("done")
