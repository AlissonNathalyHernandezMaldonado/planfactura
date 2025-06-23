<?php
$host = "facturas.mysql.database.azure.com";
$usuario = "facturasadmin";
$contrasena = "Alisson1234";
$base_datos = "factura";

$conn = new mysqli($host, $usuario, $contrasena, $base_datos);

if ($conn->connect_error) {
    die(" Error de conexión: " . $conn->connect_error);
}
$conn->set_charset("utf8");
?>
