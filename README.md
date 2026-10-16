# emaoso — portafolio

Sitio estático (HTML/CSS/JS puro, sin build ni dependencias) listo para GitHub Pages.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `emaoso` o `tu-usuario.github.io`).
2. Sube el contenido de esta carpeta a la raíz del repositorio:
   ```
   git init
   git add .
   git commit -m "Primera versión del portafolio"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source** elige `Deploy from a branch`, rama `main`, carpeta `/ (root)`.
4. Espera uno o dos minutos; GitHub te dará la URL pública (`https://tu-usuario.github.io/tu-repo/`).

## Dominio propio

Cuando compres tu dominio:
1. En **Settings → Pages → Custom domain** escribe tu dominio y guarda (esto crea un archivo `CNAME`).
2. En tu proveedor de DNS, agrega los registros que pide GitHub (un `A` apuntando a las IPs de GitHub Pages, o un `CNAME` si usas un subdominio).
3. Activa "Enforce HTTPS" cuando esté disponible.

## Qué falta por personalizar

- El correo de contacto usa tu Gmail actual; cámbialo por `hola@emaoso.com` (o el que definas) cuando tengas el dominio propio.
- Agrega tu Instagram real en el enlace de "Instagram" del footer y de la sección de contacto.
- La lista de "Trabajo seleccionado" usa proyectos reales (Nazareno Cali, RedCREA, miEco, Yawa, La Agencia UAO) pero sin imagen — cada fila muestra un color sólido al pasar el mouse. Si quieres fotos/capturas reales de cada proyecto en esa vista previa, dime y lo ajustamos.
- El archivo `assets/emaoso-mark.png` es tu logo; puedes reemplazarlo por una versión en SVG si la tienes, para que se vea nítido en pantallas grandes.
