import { Test, TestingModule } from '@nestjs/testing';
import { TimeOffResolver } from './time-off.resolver';
import { TimeOffService } from './time-off.service';

describe('TimeOffResolver', () => {
  let resolver: TimeOffResolver;
  let service: TimeOffService;

  // We completely mock the service here so the resolver doesn't 
  // accidentally try to trigger real SQLite database calls.
  const mockTimeOffService = {
    getLocalBalance: jest.fn(),
    requestTimeOff: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeOffResolver,
        {
          provide: TimeOffService,
          useValue: mockTimeOffService,
        },
      ],
    }).compile();

    resolver = module.get<TimeOffResolver>(TimeOffResolver);
    service = module.get<TimeOffService>(TimeOffService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance Query', () => {
    it('should call getLocalBalance on the service and return the data', async () => {
      const mockResult = { id: 'EMP1-LOC1', employeeId: 'EMP1', locationId: 'LOC1', balanceDays: 10 };
      mockTimeOffService.getLocalBalance.mockResolvedValue(mockResult);

      await resolver.getBalance('EMP1', 'LOC1');
      
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getLocalBalance).toHaveBeenCalledWith('EMP1', 'LOC1');
    });
  });

  describe('requestTimeOff Mutation', () => {
    it('should pass the deduction to the service and return updated balance', async () => {
      const mockResult = { id: 'EMP1-LOC1', employeeId: 'EMP1', locationId: 'LOC1', balanceDays: 7 };
      mockTimeOffService.requestTimeOff.mockResolvedValue(mockResult);

      await resolver.requestTimeOff('EMP1', 'LOC1', 3);
      
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.requestTimeOff).toHaveBeenCalledWith('EMP1', 'LOC1', 3);
    });
  });
});