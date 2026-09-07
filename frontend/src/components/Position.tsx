import React, { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const API_URL = 'http://localhost:3010';

type InterviewStep = {
    id: number;
    name: string;
    orderIndex: number;
};

type Candidate = {
    id: number;
    applicationId: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number;
};

const scoreVariant = (score: number) => {
    if (score >= 4) return 'bg-success';
    if (score >= 3) return 'bg-warning';
    return 'bg-secondary';
};

const Position: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [positionName, setPositionName] = useState('');
    const [steps, setSteps] = useState<InterviewStep[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [flowRes, candidatesRes] = await Promise.all([
                    fetch(`${API_URL}/position/${id}/interviewflow`),
                    fetch(`${API_URL}/position/${id}/candidates`)
                ]);

                if (!flowRes.ok) {
                    throw new Error(
                        flowRes.status === 404
                            ? 'No se ha encontrado la posición'
                            : `Error al cargar el flujo de entrevistas (${flowRes.status})`
                    );
                }
                if (!candidatesRes.ok) {
                    throw new Error(`Error al cargar los candidatos (${candidatesRes.status})`);
                }

                const flowData = await flowRes.json();
                const candidatesData = await candidatesRes.json();

                // El controlador envuelve la respuesta del servicio, de ahí el doble anidado.
                const flow = flowData.interviewFlow;

                if (cancelled) return;
                setPositionName(flow.positionName);
                setSteps(
                    [...flow.interviewFlow.interviewSteps].sort(
                        (a: InterviewStep, b: InterviewStep) => a.orderIndex - b.orderIndex
                    )
                );
                setCandidates(candidatesData);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : 'Error inesperado');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const onDragEnd = async (result: DropResult) => {
        const { draggableId, source, destination } = result;
        if (!destination || destination.droppableId === source.droppableId) return;

        const targetStep = steps.find(step => String(step.id) === destination.droppableId);
        const moved = candidates.find(candidate => String(candidate.applicationId) === draggableId);
        if (!targetStep || !moved) return;

        // Movimiento optimista: se guarda el estado previo para poder revertir.
        const previousCandidates = candidates;
        setUpdateError(null);
        setCandidates(candidates.map(candidate =>
            candidate.applicationId === moved.applicationId
                ? { ...candidate, currentInterviewStep: targetStep.name }
                : candidate
        ));

        try {
            const res = await fetch(`${API_URL}/candidates/${moved.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: moved.applicationId,
                    currentInterviewStep: targetStep.id
                })
            });
            if (!res.ok) {
                throw new Error(`El servidor respondió ${res.status}`);
            }
        } catch (err) {
            setCandidates(previousCandidates);
            setUpdateError(
                `No se ha podido mover a ${moved.fullName} a "${targetStep.name}": ${
                    err instanceof Error ? err.message : 'error inesperado'
                }`
            );
        }
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Button variant="link" className="ps-0 mb-3" onClick={() => navigate('/positions')}>
                    <ArrowLeft /> Volver a posiciones
                </Button>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <div className="d-flex align-items-center mb-4">
                <Button variant="link" className="ps-0 me-3" onClick={() => navigate('/positions')}>
                    <ArrowLeft size={24} />
                </Button>
                <h2 className="mb-0">{positionName}</h2>
            </div>
            {updateError && (
                <Alert variant="danger" dismissible onClose={() => setUpdateError(null)}>
                    {updateError}
                </Alert>
            )}
            <DragDropContext onDragEnd={onDragEnd}>
                <Row>
                    {steps.map(step => (
                        <Col xs={12} md key={step.id} className="mb-4">
                            <Card className="bg-light h-100">
                                <Card.Body>
                                    <Card.Title className="h6 text-center mb-3">{step.name}</Card.Title>
                                    <Droppable droppableId={String(step.id)}>
                                        {(droppableProvided) => (
                                            <div
                                                ref={droppableProvided.innerRef}
                                                {...droppableProvided.droppableProps}
                                                style={{ minHeight: '100px' }}
                                            >
                                                {candidates
                                                    .filter(candidate => candidate.currentInterviewStep === step.name)
                                                    .map((candidate, index) => (
                                                        <Draggable
                                                            key={candidate.applicationId}
                                                            draggableId={String(candidate.applicationId)}
                                                            index={index}
                                                        >
                                                            {(draggableProvided) => (
                                                                <Card
                                                                    className="shadow-sm mb-2"
                                                                    ref={draggableProvided.innerRef}
                                                                    {...draggableProvided.draggableProps}
                                                                    {...draggableProvided.dragHandleProps}
                                                                >
                                                                    <Card.Body>
                                                                        <Card.Title className="h6">{candidate.fullName}</Card.Title>
                                                                        <span className={`badge ${scoreVariant(candidate.averageScore)} text-white`}>
                                                                            {candidate.averageScore}
                                                                        </span>
                                                                    </Card.Body>
                                                                </Card>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                {droppableProvided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </DragDropContext>
        </Container>
    );
};

export default Position;
