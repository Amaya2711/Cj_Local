CREATE TABLE [n8n_produccion].[dbo].[Plantilla_Imagenes] (
    PlantillaImagenID INT IDENTITY(1,1) PRIMARY KEY,
    NodoID INT NOT NULL,
    PlantillaID INT NOT NULL,
    SegmentoID INT NOT NULL,
    EvidenciaID INT NOT NULL,
    RutaImagen VARCHAR(1000) NULL,
    IdUsuario VARCHAR(10) NULL,
    FechaRegistro DATETIME DEFAULT GETDATE()
);
-- Puedes agregar las FK si lo deseas:
-- FOREIGN KEY (NodoID) REFERENCES pla_NodoPrincipal(NodoID)
-- FOREIGN KEY (PlantillaID) REFERENCES pla_Plantilla(PlantillaID)
-- FOREIGN KEY (SegmentoID) REFERENCES pla_Segmento(SegmentoID)
-- FOREIGN KEY (EvidenciaID) REFERENCES pla_Evidencia(EvidenciaID)
