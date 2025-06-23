<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

include 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["error" => "No se recibió JSON válido"]);
    exit;
}


if (!isset($data['nombre'], $data['identificacion'], $data['telefono'], $data['fecha_emision'], $data['productos'])) {
    echo json_encode(["error" => "Faltan campos obligatorios"]);
    exit;
}

$nombre = $data['nombre'];
$identificacion = $data['identificacion'];
$telefono = $data['telefono'];
$fecha_emision = $data['fecha_emision'];
$observaciones = $data['observaciones'] ?? '';
$total = $data['total'] ?? 0;
$productos = $data['productos'];

$stmt_cliente = $conn->prepare("INSERT INTO clientes (nombre, identificacion, telefono) VALUES (?, ?, ?)");
$stmt_cliente->bind_param("sss", $nombre, $identificacion, $telefono);
if (!$stmt_cliente->execute()) {
    echo json_encode(["error" => "Error al insertar cliente", "detalle" => $stmt_cliente->error]);
    exit;
}
$cliente_id = $stmt_cliente->insert_id;
$stmt_cliente->close();

$stmt_factura = $conn->prepare("INSERT INTO facturas (cliente_id, fecha_emision, observaciones, total) VALUES (?, ?, ?, ?)");
$stmt_factura->bind_param("isss", $cliente_id, $fecha_emision, $observaciones, $total);
if (!$stmt_factura->execute()) {
    echo json_encode(["error" => "Error al insertar factura", "detalle" => $stmt_factura->error]);
    exit;
}
$factura_id = $stmt_factura->insert_id;
$stmt_factura->close();

$stmt_producto = $conn->prepare("INSERT INTO detalle_productos (factura_id, producto_id, nombre_producto, cantidad, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?, ?)");
foreach ($productos as $p) {
    $producto_id = $p['producto_id'] ?? null;
    $nombre_producto = $p['nombre_producto'];
    $cantidad = intval($p['cantidad']);
    $valor_unitario = floatval($p['valor_unitario']);
    $valor_total = $cantidad * $valor_unitario;

    $stmt_producto->bind_param("issidd", $factura_id, $producto_id, $nombre_producto, $cantidad, $valor_unitario, $valor_total);
    if (!$stmt_producto->execute()) {
        echo json_encode(["error" => "Error al insertar producto", "detalle" => $stmt_producto->error]);
        exit;
    }
}
$stmt_producto->close();
$conn->close();

echo json_encode(["mensaje" => "✅ Factura registrada con éxito."]);
