export const appointmentScheduledTemplate = (params: { pacienteNome: string; examNome: string; dataHora: string; instrucoes?: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222; background-color:#f5f5f5;">
    <div style="max-width:600px;margin:20px auto;padding:30px;border:1px solid #ddd;background-color:#fff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color:#0066cc;text-align:center;margin-bottom:30px;border-bottom:2px solid #0066cc;padding-bottom:15px;">✓ Agendamento Confirmado</h2>
      
      <p style="font-size:16px;margin-bottom:20px;">Olá, <strong>${params.pacienteNome}</strong>,</p>
      
      <p style="font-size:14px;margin-bottom:20px;line-height:1.6;">
        Seu agendamento foi confirmado com sucesso! Abaixo estão todos os detalhes do seu exame:
      </p>

      <div style="background-color:#f0f7ff;padding:20px;border-radius:6px;margin-bottom:20px;border-left:4px solid #0066cc;">
        <p style="margin:8px 0;"><strong style="color:#0066cc;">Exame:</strong> ${params.examNome}</p>
        <p style="margin:8px 0;"><strong style="color:#0066cc;">Data e Hora:</strong> ${params.dataHora}</p>
      </div>

      ${params.instrucoes ? `
      <div style="margin-bottom:20px;">
        <h3 style="color:#0066cc;margin-bottom:12px;border-bottom:1px solid #0066cc;padding-bottom:8px;">📋 Preparação para o Exame</h3>
        <div style="background-color:#fffbf0;padding:15px;border-radius:6px;border-left:4px solid #ff9800;font-size:14px;line-height:1.6;">${params.instrucoes}</div>
      </div>
      ` : ''}

      <div style="background-color:#f0f7ff;padding:15px;border-radius:6px;margin-bottom:20px;border-left:4px solid #0066cc;font-size:13px;">
        <p style="margin:0;"><strong>⚠️ Importante:</strong> Chegue com 10 minutos de antecedência. Leve documento de identificação.</p>
      </div>
    </div>
  </body>
</html>`;

export const appointmentReminderTemplate = (params: { pacienteNome: string; examNome: string; dataHora: string; instrucoes?: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222; background-color:#f5f5f5;">
    <div style="max-width:600px;margin:20px auto;padding:30px;border:1px solid #ddd;background-color:#fff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color:#ff9800;text-align:center;margin-bottom:30px;border-bottom:2px solid #ff9800;padding-bottom:15px;">🔔 Lembrete de Exame</h2>
      
      <p style="font-size:16px;margin-bottom:20px;">Olá, <strong>${params.pacienteNome}</strong>,</p>
      
      <p style="font-size:14px;margin-bottom:20px;line-height:1.6;">
        Este é um lembrete de que você tem um exame agendado. Confira os detalhes abaixo:
      </p>

      <div style="background-color:#fff8f0;padding:20px;border-radius:6px;margin-bottom:20px;border-left:4px solid #ff9800;">
        <p style="margin:8px 0;"><strong style="color:#ff9800;">Exame:</strong> ${params.examNome}</p>
        <p style="margin:8px 0;"><strong style="color:#ff9800;">Data e Hora:</strong> ${params.dataHora}</p>
      </div>

      ${params.instrucoes ? `
      <div style="margin-bottom:20px;">
        <h3 style="color:#ff9800;margin-bottom:12px;border-bottom:1px solid #ff9800;padding-bottom:8px;">📋 Orientações para o Preparo</h3>
        <div style="background-color:#fff8f0;padding:15px;border-radius:6px;border-left:4px solid #ff9800;font-size:14px;line-height:1.6;">${params.instrucoes}</div>
      </div>
      ` : ''}

      <div style="background-color:#fff3cd;padding:15px;border-radius:6px;margin-bottom:20px;border-left:4px solid #ffc107;font-size:13px;">
        <p style="margin:0;"><strong>⏰ Dica:</strong> Chegue com 10 minutos de antecedência. Leve seu documento de identificação.</p>
      </div>
    </div>
  </body>
</html>`;

export const appointmentReadyTemplate = (params: { pacienteNome: string; examNome: string; retiradaInfo: string; dataHoraRetirada?: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222; background-color:#f5f5f5;">
    <div style="max-width:600px;margin:20px auto;padding:30px;border:1px solid #ddd;background-color:#fff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color:#28a745;text-align:center;margin-bottom:30px;border-bottom:2px solid #28a745;padding-bottom:15px;">✓ Resultado Pronto para Retirada</h2>
      
      <p style="font-size:16px;margin-bottom:20px;">Olá, <strong>${params.pacienteNome}</strong>,</p>
      
      <p style="font-size:14px;margin-bottom:20px;line-height:1.6;">
        Ótimas notícias! O resultado do seu exame está pronto para retirada.
      </p>

      <div style="background-color:#f0f7f0;padding:20px;border-radius:6px;margin-bottom:20px;border-left:4px solid #28a745;">
        <p style="margin:8px 0;"><strong style="color:#28a745;">Exame:</strong> ${params.examNome}</p>
        <p style="margin:8px 0;"><strong style="color:#28a745;">Status:</strong> Pronto para Retirada</p>
        ${params.dataHoraRetirada ? `<p style="margin:8px 0;"><strong style="color:#28a745;">Data e Hora da Retirada:</strong> ${params.dataHoraRetirada}</p>` : ''}
      </div>

      <div style="background-color:#f0f7f0;padding:20px;border-radius:6px;margin-bottom:20px;border-left:4px solid #28a745;">
        <h3 style="color:#28a745;margin-top:0;margin-bottom:12px;">📍 Como Retirar</h3>
        <div style="font-size:14px;line-height:1.8;color:#333;">${params.retiradaInfo}</div>
      </div>

      <div style="background-color:#fff3cd;padding:15px;border-radius:6px;margin-bottom:20px;border-left:4px solid #ffc107;font-size:13px;">
        <p style="margin:0;"><strong>ℹ️ Informações:</strong> Leve seu documento de identificação para agilizar o processo de retirada.</p>
      </div>
    </div>
  </body>
</html>`;

export const appointmentCanceledTemplate = (params: { pacienteNome: string; examNome: string; dataHora: string; motivo?: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222; background-color:#f5f5f5;">
    <div style="max-width:600px;margin:20px auto;padding:30px;border:1px solid #ddd;background-color:#fff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color:#cc0000;text-align:center;margin-bottom:30px;border-bottom:2px solid #cc0000;padding-bottom:15px;">✗ Agendamento Cancelado</h2>
      
      <p style="font-size:16px;margin-bottom:20px;">Olá, <strong>${params.pacienteNome}</strong>,</p>
      
      <p style="font-size:14px;margin-bottom:20px;line-height:1.6;">
        Informamos que seu agendamento foi cancelado.
      </p>

      <div style="background-color:#ffe6e6;padding:20px;border-radius:6px;margin-bottom:20px;border-left:4px solid #cc0000;">
        <p style="margin:8px 0;"><strong style="color:#cc0000;">Exame:</strong> ${params.examNome}</p>
        <p style="margin:8px 0;"><strong style="color:#cc0000;">Data e Hora:</strong> ${params.dataHora}</p>
        <p style="margin:8px 0;"><strong style="color:#cc0000;">Status:</strong> Cancelado</p>
      </div>

      ${params.motivo ? `
      <div style="background-color:#fff3cd;padding:20px;border-radius:6px;margin-bottom:20px;border-left:4px solid #ff9800;">
        <h3 style="color:#ff9800;margin-top:0;margin-bottom:12px;">📌 Motivo do Cancelamento</h3>
        <p style="font-size:14px;line-height:1.6;margin:0;color:#333;">${params.motivo}</p>
      </div>
      ` : ''}

      <div style="background-color:#f0f7ff;padding:15px;border-radius:6px;margin-bottom:20px;border-left:4px solid #0066cc;font-size:13px;">
        <p style="margin:0;"><strong>ℹ️ Próximas Ações:</strong> Se deseja reagendar, entre em contato conosco para agendar uma nova data.</p>
      </div>
    </div>
  </body>
</html>`;

export const appointmentCompletedTemplate = (params: { pacienteNome: string; examNome: string; dataRealizacao: string; horaRealizacao?: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222; background-color:#f5f5f5;">
    <div style="max-width:600px;margin:20px auto;padding:30px;border:1px solid #ddd;background-color:#fff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color:#6c63ff;text-align:center;margin-bottom:30px;border-bottom:2px solid #6c63ff;padding-bottom:15px;">✓ Exame Realizado</h2>
      
      <p style="font-size:16px;margin-bottom:20px;">Olá, <strong>${params.pacienteNome}</strong>,</p>
      
      <p style="font-size:14px;margin-bottom:20px;line-height:1.6;">
        Seu exame foi realizado com sucesso! Confira os detalhes abaixo:
      </p>

      <div style="background-color:#f0e6ff;padding:20px;border-radius:6px;margin-bottom:20px;border-left:4px solid #6c63ff;">
        <p style="margin:8px 0;"><strong style="color:#6c63ff;">Exame:</strong> ${params.examNome}</p>
        <p style="margin:8px 0;"><strong style="color:#6c63ff;">Data de Realização:</strong> ${params.dataRealizacao}${params.horaRealizacao ? ` às ${params.horaRealizacao}` : ''}</p>
      </div>

      <div style="background-color:#fff3cd;padding:20px;border-radius:6px;margin-bottom:20px;border-left:4px solid #ff9800;">
        <h3 style="color:#ff9800;margin-top:0;margin-bottom:12px;">⏳ Próximos Passos</h3>
        <p style="font-size:14px;line-height:1.8;margin:0;color:#333;">
          Estamos processando seu resultado. Em breve, você receberá um novo e-mail informando a data e horário para retirada do resultado. 
          <strong>Fique atento à sua caixa de entrada!</strong>
        </p>
      </div>

      <div style="background-color:#f0f7f0;padding:15px;border-radius:6px;margin-bottom:20px;border-left:4px solid #28a745;font-size:13px;">
        <p style="margin:0;"><strong>✓ Status:</strong> Seu exame foi realizado com sucesso. Assim que o resultado estiver pronto, entraremos em contato.</p>
      </div>
    </div>
  </body>
</html>`;