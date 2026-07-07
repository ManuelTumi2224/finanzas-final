-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_usuario` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `nombre_completo` VARCHAR(100) NOT NULL,
    `tipo_usuario` VARCHAR(30) NOT NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultimo_login` DATETIME(3) NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `usuarios_nombre_usuario_key`(`nombre_usuario`),
    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `dni` VARCHAR(8) NOT NULL,
    `nombres` VARCHAR(100) NOT NULL,
    `apellidos` VARCHAR(100) NOT NULL,
    `fecha_nacimiento` DATE NULL,
    `direccion` VARCHAR(255) NULL,
    `telefono` VARCHAR(20) NULL,
    `telefono_fijo` VARCHAR(20) NULL,
    `correo` VARCHAR(100) NULL,
    `ingresos_mensuales` DECIMAL(12, 2) NULL,
    `otros_ingresos` DECIMAL(12, 2) NULL,
    `gastos_mensuales` DECIMAL(12, 2) NULL,
    `estado_civil` VARCHAR(30) NULL,
    `ocupacion` VARCHAR(100) NULL,
    `historial_crediticio` VARCHAR(100) NULL,
    `observaciones` TEXT NULL,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `clientes_dni_key`(`dni`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehiculos` (
    `id_vehiculo` INTEGER NOT NULL AUTO_INCREMENT,
    `placa` VARCHAR(20) NULL,
    `marca` VARCHAR(50) NOT NULL,
    `modelo` VARCHAR(50) NOT NULL,
    `anio` INTEGER NOT NULL,
    `version` VARCHAR(50) NULL,
    `precio_venta` DECIMAL(12, 2) NOT NULL,
    `moneda` VARCHAR(10) NULL,
    `tipo_vehiculo` VARCHAR(50) NULL,
    `color` VARCHAR(30) NULL,
    `kilometraje` INTEGER NULL,
    `numero_serie` VARCHAR(100) NOT NULL,
    `concesionario` VARCHAR(100) NULL,
    `tipo_combustible` VARCHAR(50) NULL,
    `transmision` VARCHAR(30) NULL,
    `estado_vehiculo` VARCHAR(20) NULL,
    `estado_disponibilidad` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `vehiculos_numero_serie_key`(`numero_serie`),
    PRIMARY KEY (`id_vehiculo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entidades_financieras` (
    `id_entidad` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_entidad` VARCHAR(20) NOT NULL,
    `nombre_entidad` VARCHAR(100) NOT NULL,
    `tipo_entidad` VARCHAR(50) NULL,
    `tea_minima` DECIMAL(5, 2) NULL,
    `tea_maxima` DECIMAL(5, 2) NULL,
    `comision_estudio` DECIMAL(10, 2) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `fecha_actualizacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `entidades_financieras_codigo_entidad_key`(`codigo_entidad`),
    PRIMARY KEY (`id_entidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `simulaciones` (
    `id_simulacion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NOT NULL,
    `id_vehiculo` INTEGER NOT NULL,
    `id_entidad` INTEGER NOT NULL,
    `id_usuario_registro` INTEGER NOT NULL,
    `codigo_simulacion` VARCHAR(50) NOT NULL,
    `fecha_simulacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `moneda` VARCHAR(10) NULL,
    `tipo_cambio` DECIMAL(10, 4) NULL,
    `estado` VARCHAR(30) NULL,
    `observaciones` TEXT NULL,

    UNIQUE INDEX `simulaciones_codigo_simulacion_key`(`codigo_simulacion`),
    INDEX `simulaciones_id_cliente_idx`(`id_cliente`),
    INDEX `simulaciones_id_vehiculo_idx`(`id_vehiculo`),
    INDEX `simulaciones_id_entidad_idx`(`id_entidad`),
    INDEX `simulaciones_id_usuario_registro_idx`(`id_usuario_registro`),
    PRIMARY KEY (`id_simulacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parametros_credito` (
    `id_parametro` INTEGER NOT NULL AUTO_INCREMENT,
    `id_simulacion` INTEGER NOT NULL,
    `precio_vehiculo` DECIMAL(12, 2) NOT NULL,
    `cuota_inicial_porc` DECIMAL(5, 2) NOT NULL,
    `cuota_inicial_monto` DECIMAL(12, 2) NOT NULL,
    `monto_financiado` DECIMAL(12, 2) NOT NULL,
    `cuota_balloon_porc` DECIMAL(5, 2) NOT NULL,
    `cuota_balloon_monto` DECIMAL(12, 2) NOT NULL,
    `plazo_meses` INTEGER NOT NULL,
    `tipo_tasa` VARCHAR(30) NOT NULL,
    `valor_tasa` DECIMAL(8, 4) NOT NULL,
    `capitalizacion` VARCHAR(30) NULL,
    `tipo_gracia` VARCHAR(30) NULL,
    `meses_gracia` INTEGER NOT NULL DEFAULT 0,
    `seguro_desgravamen_porc` DECIMAL(8, 4) NULL,
    `seguro_vehicular_monto` DECIMAL(12, 2) NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `parametros_credito_id_simulacion_key`(`id_simulacion`),
    PRIMARY KEY (`id_parametro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cronograma_pagos` (
    `id_cronograma` INTEGER NOT NULL AUTO_INCREMENT,
    `id_simulacion` INTEGER NOT NULL,
    `numero_cuota` INTEGER NOT NULL,
    `fecha_vencimiento` DATE NULL,
    `saldo_inicial` DECIMAL(12, 2) NOT NULL,
    `cuota` DECIMAL(12, 2) NOT NULL,
    `interes` DECIMAL(12, 2) NOT NULL,
    `amortizacion` DECIMAL(12, 2) NOT NULL,
    `seguro_desgravamen` DECIMAL(12, 2) NOT NULL,
    `seguro_vehicular` DECIMAL(12, 2) NOT NULL,
    `comisiones` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `saldo_final` DECIMAL(12, 2) NOT NULL,
    `es_periodo_gracia` BOOLEAN NOT NULL DEFAULT false,
    `tipo_gracia_aplicada` VARCHAR(30) NULL,

    INDEX `cronograma_pagos_id_simulacion_idx`(`id_simulacion`),
    PRIMARY KEY (`id_cronograma`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resultados_credito` (
    `id_resultado` INTEGER NOT NULL AUTO_INCREMENT,
    `id_simulacion` INTEGER NOT NULL,
    `tea_calculada` DECIMAL(8, 4) NOT NULL,
    `tem_calculada` DECIMAL(8, 4) NOT NULL,
    `tcea` DECIMAL(8, 4) NOT NULL,
    `cuota_promedio` DECIMAL(12, 2) NOT NULL,
    `total_intereses` DECIMAL(12, 2) NOT NULL,
    `total_seguros` DECIMAL(12, 2) NOT NULL,
    `total_comisiones` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `costo_total_credito` DECIMAL(12, 2) NOT NULL,
    `van` DECIMAL(12, 2) NOT NULL,
    `tir` DECIMAL(8, 4) NOT NULL,
    `tasa_descuento_van` DECIMAL(8, 4) NOT NULL,
    `fecha_calculo` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `resultados_credito_id_simulacion_key`(`id_simulacion`),
    PRIMARY KEY (`id_resultado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seguros_comisiones` (
    `id_concepto` INTEGER NOT NULL AUTO_INCREMENT,
    `id_simulacion` INTEGER NOT NULL,
    `tipo_concepto` VARCHAR(50) NULL,
    `descripcion` VARCHAR(255) NULL,
    `modalidad_calculo` VARCHAR(50) NULL,
    `valor` DECIMAL(12, 2) NULL,
    `periodicidad` VARCHAR(30) NULL,
    `es_obligatorio` BOOLEAN NOT NULL DEFAULT true,
    `afecta_tcea` BOOLEAN NOT NULL DEFAULT true,

    INDEX `seguros_comisiones_id_simulacion_idx`(`id_simulacion`),
    PRIMARY KEY (`id_concepto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditoria` (
    `id_auditoria` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `tabla_afectada` VARCHAR(100) NULL,
    `accion` VARCHAR(50) NULL,
    `registro_afectado` INTEGER NULL,
    `datos_anteriores` TEXT NULL,
    `datos_nuevos` TEXT NULL,
    `fecha_accion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip_address` VARCHAR(45) NULL,

    INDEX `auditoria_id_usuario_idx`(`id_usuario`),
    PRIMARY KEY (`id_auditoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `simulaciones` ADD CONSTRAINT `simulaciones_id_cliente_fkey` FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simulaciones` ADD CONSTRAINT `simulaciones_id_vehiculo_fkey` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos`(`id_vehiculo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simulaciones` ADD CONSTRAINT `simulaciones_id_entidad_fkey` FOREIGN KEY (`id_entidad`) REFERENCES `entidades_financieras`(`id_entidad`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simulaciones` ADD CONSTRAINT `simulaciones_id_usuario_registro_fkey` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parametros_credito` ADD CONSTRAINT `parametros_credito_id_simulacion_fkey` FOREIGN KEY (`id_simulacion`) REFERENCES `simulaciones`(`id_simulacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cronograma_pagos` ADD CONSTRAINT `cronograma_pagos_id_simulacion_fkey` FOREIGN KEY (`id_simulacion`) REFERENCES `simulaciones`(`id_simulacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resultados_credito` ADD CONSTRAINT `resultados_credito_id_simulacion_fkey` FOREIGN KEY (`id_simulacion`) REFERENCES `simulaciones`(`id_simulacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seguros_comisiones` ADD CONSTRAINT `seguros_comisiones_id_simulacion_fkey` FOREIGN KEY (`id_simulacion`) REFERENCES `simulaciones`(`id_simulacion`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditoria` ADD CONSTRAINT `auditoria_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

