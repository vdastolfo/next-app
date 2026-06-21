package com.next.subastas.config;

import com.next.subastas.model.Foto;
import com.next.subastas.model.Producto;
import com.next.subastas.repository.FotoRepository;
import com.next.subastas.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Lee fotos de src/main/resources/fotos/{productoId}/*.jpg
 * y las carga en DB al arrancar, reemplazando placeholders.
 *
 * Ejemplo: fotos/8/1.jpg → fotos del producto con identificador = 8
 *
 * Para recargar: DELETE FROM fotos WHERE producto = 8; y reiniciá.
 */
@Component
public class FotoDataLoader implements ApplicationRunner {

    @Autowired private FotoRepository fotoRepository;
    @Autowired private ProductoRepository productoRepository;

    @Override
    public void run(ApplicationArguments args) {
        Path fotosBase = resolverCarpetaFotos();

        if (fotosBase == null) {
            System.out.println("[FotoLoader] Carpeta fotos/ no encontrada. " +
                "Creála en src/main/resources/fotos/{productoId}/*.jpg");
            return;
        }

        System.out.println("[FotoLoader] Carpeta base: " + fotosBase.toAbsolutePath());

        File[] subcarpetas = fotosBase.toFile().listFiles(File::isDirectory);
        if (subcarpetas == null || subcarpetas.length == 0) {
            System.out.println("[FotoLoader] No hay subcarpetas en fotos/. " +
                "Creá fotos/{productoId}/ con tus imágenes.");
            return;
        }

        for (File subcarpeta : subcarpetas) {
            String nombre = subcarpeta.getName();

            // El nombre de la carpeta debe ser un número (el ID del producto)
            Integer productoId;
            try {
                productoId = Integer.parseInt(nombre);
            } catch (NumberFormatException e) {
                System.out.println("[FotoLoader] Ignorando carpeta '" + nombre +
                    "' — el nombre debe ser el ID del producto (número).");
                continue;
            }

            Optional<Producto> productoOpt = productoRepository.findById(productoId);
            if (productoOpt.isEmpty()) {
                System.out.println("[FotoLoader] No existe producto con ID " + productoId);
                continue;
            }
            Producto producto = productoOpt.get();

            File[] archivos = subcarpeta.listFiles(f -> {
                String name = f.getName().toLowerCase();
                return f.isFile() && (name.endsWith(".jpg") || name.endsWith(".jpeg"));
            });
            if (archivos == null || archivos.length == 0) {
                System.out.println("[FotoLoader] Sin .jpg en: " + subcarpeta.getPath());
                continue;
            }
            Arrays.sort(archivos, Comparator.comparing(File::getName));

            // Solo reemplazar si son placeholders (≤ 100 bytes)
            List<Foto> actuales = fotoRepository.findAllByProductoIdentificador(productoId);
            boolean soloPlaceholders = actuales.stream()
                .allMatch(f -> f.getFoto() == null || f.getFoto().length <= 100);

            if (!soloPlaceholders) {
                System.out.println("[FotoLoader] Producto " + productoId +
                    " (" + producto.getDescripcionCatalogo() + ") ya tiene fotos reales.");
                continue;
            }

            fotoRepository.deleteAll(actuales);

            int cargadas = 0;
            for (File archivo : archivos) {
                try {
                    Foto foto = new Foto();
                    foto.setProducto(producto);
                    foto.setFoto(Files.readAllBytes(archivo.toPath()));
                    fotoRepository.save(foto);
                    cargadas++;
                } catch (IOException e) {
                    System.out.println("[FotoLoader] Error leyendo " + archivo.getName() +
                        ": " + e.getMessage());
                }
            }

            System.out.println("[FotoLoader] ✓ " + cargadas + " fotos cargadas → " +
                producto.getDescripcionCatalogo() + " (ID " + productoId + ")");
        }
    }

    private Path resolverCarpetaFotos() {
        try {
            URL url = getClass().getClassLoader().getResource("fotos");
            if (url != null) {
                Path p = Paths.get(url.toURI());
                if (Files.exists(p)) return p;
            }
        } catch (Exception ignored) {}

        Path[] candidatos = {
            Paths.get("src/main/resources/fotos"),
            Paths.get("backend/src/main/resources/fotos"),
        };
        for (Path p : candidatos) {
            if (Files.exists(p)) return p;
        }
        return null;
    }
}
