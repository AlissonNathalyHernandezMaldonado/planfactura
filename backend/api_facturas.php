<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'conexion.php';


$method = $_SERVER['REQUEST_METHOD'];

$input = json_decode(file_get_contents("php://input"), true);


switch ($method) {
    case 'GET':
        
        $sql = "SELECT f.id, c.nombre AS cliente, f.fecha_emision, f.total 
                FROM facturas f
                JOIN clientes c ON f.cliente_id = c.id";
        $result = $conn->query($sql);
        $facturas = [];

        while ($row = $result->fetch_assoc()) {
            $facturas[] = $row;
        }

        echo json_encode($facturas);
        break;

    case 'POST':
        
        if (!$input || !isset($input['nombre'], $input['identificacion'], $input['telefono'], $input['fecha_emision'], $input['productos'])) {
            echo json_encode(["error" => "Datos incompletos"]);
            exit;
        }

        $nombre = $input['nombre'];
        $identificacion = $input['identificacion'];
        $telefono = $input['telefono'];
        $fecha = $input['fecha_emision'];
        $observaciones = $input['observaciones'] ?? '';
        $total = $input['total'] ?? 0;
        $productos = $input['productos'];

        $conn->begin_transaction();

        try {
            
            $stmt = $conn->prepare("INSERT INTO clientes (nombre, identificacion, telefono) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $nombre, $identificacion, $telefono);
            $stmt->execute();
            $cliente_id = $stmt->insert_id;
            $stmt->close();

            
            $stmt = $conn->prepare("INSERT INTO facturas (cliente_id, fecha_emision, observaciones, total) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isss", $cliente_id, $fecha, $observaciones, $total);
            $stmt->execute();
            $factura_id = $stmt->insert_id;
            $stmt->close();

            
            $stmt = $conn->prepare("INSERT INTO detalle_productos (factura_id, producto_id, nombre_producto, cantidad, valor_unitario, valor_total) VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($productos as $p) {
                $pid = $p['producto_id'] ?? null;
                $nombre_producto = $p['nombre_producto'];
                $cantidad = intval($p['cantidad']);
                $valor_unitario = floatval($p['valor_unitario']);
                $valor_total = $cantidad * $valor_unitario;

                $stmt->bind_param("issidd", $factura_id, $pid, $nombre_producto, $cantidad, $valor_unitario, $valor_total);
                $stmt->execute();
            }
            $stmt->close();

            $conn->commit();
            echo json_encode(["mensaje" => "✅ Factura creada"]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["error" => " Error al crear factura", "detalle" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        
        if (!isset($_GET['id']) || !isset($input['total'])) {
            echo json_encode(["error" => "ID y total requeridos"]);
            exit;
        }

        $id = intval($_GET['id']);
        $total = floatval($input['total']);

        $stmt = $conn->prepare("UPDATE facturas SET total = ? WHERE id = ?");
        $stmt->bind_param("di", $total, $id);
        if ($stmt->execute()) {
            echo json_encode(["mensaje" => "Factura actualizada"]);
        } else {
            echo json_encode(["error" => "Error al actualizar"]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            echo json_encode(["error" => "ID de factura requerido"]);
            exit;
        }

        $id = intval($_GET['id']);
        $stmt = $conn->prepare("DELETE FROM facturas WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(["mensaje" => "Factura eliminada"]);
        } else {
            echo json_encode(["error" => "Error al eliminar factura"]);
        }
        $stmt->close();
        break;

    default:
        echo json_encode(["error" => "Método no soportado"]);
        break;
}
