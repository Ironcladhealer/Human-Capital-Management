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
      // We tell our mock what to pretend the database returned
      const mockResult = { id: 'EMP1-LOC1', employeeId: 'EMP1', locationId: 'LOC1', balanceDays: 10 };
      mockTimeOffService.getLocalBalance.mockResolvedValue(mockResult);

      // We hit the resolver exactly how the GraphQL query would
      const result = await resolver.getBalance('EMP1', 'LOC1');
      
      expect(service.getLocalBalance).toHaveBeenCalledWith('EMP1', 'LOC1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('requestTimeOff Mutation', () => {
    it('should pass the deduction to the service and return updated balance', async () => {
      const mockResult = { id: 'EMP1-LOC1', employeeId: 'EMP1', locationId: 'LOC1', balanceDays: 7 };
      mockTimeOffService.requestTimeOff.mockResolvedValue(mockResult);

      const result = await resolver.requestTimeOff('EMP1', 'LOC1', 3);
      
      expect(service.requestTimeOff).toHaveBeenCalledWith('EMP1', 'LOC1', 3);
      expect(result).toEqual(mockResult);
    });
  });
});